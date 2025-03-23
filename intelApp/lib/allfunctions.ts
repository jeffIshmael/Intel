// This file contains all the blockchain write functions

import { intelContractAddress, intelAbi } from "@/Blockchain/intelContract";
import { publicClient, walletClient } from "@/lib/config";
import { privateKeyToAccount } from "viem/accounts";

// cUSD Contract Address on Celo (used to pay gas fees)
const cUSDAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"; // cUSD token contract

// Function to send cUSD to the contract
export async function stakecUSD(privateKey: `0x${string}`, amount: number) {
  const account = privateKeyToAccount(privateKey);
  
  try {
    const { request } = await publicClient.simulateContract({
      address: intelContractAddress,
      abi: intelAbi,
      functionName: "deposit",
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

// Function to send from the contract to a staking pool
export async function sendingToStakingPool(stakingPoolAddress: `0x${string}`, privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);

  try {
    const { request } = await publicClient.simulateContract({
      address: intelContractAddress,
      abi: intelAbi,
      functionName: "stakeInBestPool",
      args: [stakingPoolAddress],
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
