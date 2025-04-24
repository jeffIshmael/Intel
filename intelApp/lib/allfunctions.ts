// This file contains all the blockchain write functions

import { intelContractAddress, intelAbi } from "@/Blockchain/intelContract";
import { publicClient, walletClient } from "@/lib/config";
import { privateKeyToAccount } from "viem/accounts";
import {
  executeCommand,
  createSession,
  queryContract,
} from "@/scripts/Nebula.mjs";
import cUSDAbi from "@/Blockchain/erc20.json";
import { formatEther } from "viem";

// cUSD Contract Address on Celo (used to pay gas fees)
const cUSDAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a"; // cUSD token contract

// Function to get user's cUSD balance
async function getcUSDBalance(userAddress: `0x${string}`) {
  try {
    const balance = await publicClient.readContract({
      address: cUSDAddress,
      abi: cUSDAbi,
      functionName: "balanceOf",
      args: [userAddress],
    });

    return BigInt(Number(balance)); // Return balance in Wei
  } catch (error) {
    console.error("Failed to fetch cUSD balance:", error);
    return BigInt(0);
  }
}

// Function to approve cUSD spending for your contract
export async function approvecUSD(privateKey: `0x${string}`, amount: number) {
  const account = privateKeyToAccount(privateKey);
  const userAddress = account.address;
  const parsedAmount = BigInt(amount * 10 ** 18); // Convert amount to Wei

  try {
    // Fetch user's cUSD balance
    const userBalance = await getcUSDBalance(userAddress as `0x${string}`);

    // Ensure user has enough cUSD
    if (userBalance < parsedAmount) {
      throw new Error(
        `Insufficient cUSD balance. Available: ${
          Number(userBalance) / 10 ** 18
        } cUSD`
      );
    }

    // Simulate approve transaction
    const { request } = await publicClient.simulateContract({
      address: cUSDAddress,
      abi: cUSDAbi,
      functionName: "approve",
      args: [intelContractAddress, parsedAmount], // Approve your contract
      account,
    });

    // Send approval transaction using cUSD as gas
    const hash = await walletClient.writeContract({
      ...request,
      feeCurrency: cUSDAddress,
    });

    console.log("Approval Transaction Hash:", hash);
    return hash;
  } catch (error) {
    console.error("Approval failed:", error);
    return error;
  }
}

// Function to send cUSD to the contract
export async function stakecUSD(privateKey: `0x${string}`, amount: number) {
  const account = privateKeyToAccount(privateKey);
  console.log("Account:", account.address);

  try {
    const { request } = await publicClient.simulateContract({
      address: intelContractAddress,
      abi: intelAbi,
      functionName: "deposit",
      args: [BigInt(amount)],
      account,
    });

    console.log("Staking...");
    const hash = await walletClient.writeContract({
      ...request,
      feeCurrency: cUSDAddress,
    });
    return hash || null;
  } catch (error) {
    console.error("Error staking:", error);
    return error;
  }
}

// Function to send from the contract to a staking pool when using nebula AI
export async function sendingToStakingPool(stakingPoolAddress: string) {
  const message = `Execute the function  stakeInBestPool(address _stakingPool) external onlyAIAgent of contract address ${intelContractAddress} on chainId 42220 with the address ${stakingPoolAddress} as an argument./n Do it I have sorted everything with the details I'm giving you./n And yes I'm aware it has an OnlyAIAgent modifier so I provided the address of the AI agent.
  /n Please just execute I'm waiting for the tx hash`;
  const IntelAIWalletAddress = "0x4821ced48Fb4456055c86E42587f61c1F39c6315";

  try {
    const session = await createSession();
    console.log(session);
    const contract = await queryContract(intelContractAddress, 42220, session);
    console.log(contract);
    const transaction = await executeCommand(
      message,
      IntelAIWalletAddress,
      "default-user",
      false,
      42220,
      intelContractAddress,
      session
    );
    if (transaction) {
      console.log("successfull");
      return transaction;
    }
    return null;
  } catch (error) {
    return error;
  }
}

// Function to send from the contract to a staking pool
export async function sendToStakingPool(
  privateKey: `0x${string}`,
  stakingPool: `0x${string}`
) {
  const account = privateKeyToAccount(privateKey);
  console.log("Account:", account.address);

  try {
    const { request } = await publicClient.simulateContract({
      address: intelContractAddress,
      abi: intelAbi,
      functionName: "stakeInBestPool",
      args: [stakingPool],
      account,
      feeCurrency: cUSDAddress,
    });

    console.log("AI is staking...");
    const hash = await walletClient.writeContract(request);
    return hash || null;
  } catch (error) {
    console.error("Error staking:", error);
    return error;
  }
}

//function to withdraw from the staking pool to the contract to the user
export async function unStakecUSD(privateKey: `0x${string}`, amount: number) {
  const account = privateKeyToAccount(privateKey);

  try {
    const { request } = await publicClient.simulateContract({
      address: intelContractAddress,
      abi: intelAbi,
      functionName: "withdraw",
      args: [amount],
      account,
    });

    // Use cUSD for gas fees
    const hash = await walletClient.writeContract({
      ...request,
      feeCurrency: cUSDAddress,
    });

    return hash || null;
  } catch (error) {
    return error;
  }
}

//function to send to the smart contract
export async function sendcUSD(
  privateKey: `0x${string}`,
  to: `0x${string}`, //in wei
  amount: number
) {
  try {
    // Create a Wallet Client
    const account = privateKeyToAccount(privateKey);
    // Fetch user's cUSD balance
    const userBalance = await getcUSDBalance(account.address as `0x${string}`);

    // Ensure user has enough cUSD
    if (userBalance < amount) {
      throw new Error(
        `Insufficient cUSD balance. Available: ${
          Number(userBalance) / 10 ** 18
        } cUSD`
      );
    }
    // Send cUSD Transaction
    const txHash = await walletClient.writeContract({
      address: cUSDAddress,
      abi: cUSDAbi,
      functionName: "transfer",
      args: [to, BigInt(amount)],
      account,
      feeCurrency: cUSDAddress,
    });

    console.log("Transaction Hash:", txHash);
    const checkoutTxnReceipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    if (checkoutTxnReceipt.status == "success") {
      return checkoutTxnReceipt.transactionHash;
    }
    return false;
  } catch (error) {
    console.error("Error sending cUSD:", error);
    return null;
  }
}

// function to get cUSD balance of a user
export async function getBalance(address: `0x${string}`) {
  const balance = await publicClient.readContract({
    address: cUSDAddress,
    abi: cUSDAbi,
    functionName: "balanceOf",
    args: [address],
  });
  return formatEther(balance as bigint);
}



