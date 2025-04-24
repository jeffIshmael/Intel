// this folder contains cron jobs for the ai agent
"use server";

import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";

import { intelContractAddress, intelAbi } from "@/Blockchain/intelContract";
import { celo } from "viem/chains";
import { publicClient } from "./config";
import { getUnemailedUsers, sendStakingEmail } from "./functions";
import dotenv from "dotenv";
dotenv.config();

const aiAgentPrivateKey = process.env.AI_AGENT_PRIVATE_KEY as `0x${string}`;
if (!aiAgentPrivateKey) {
  throw new Error("AI_AGENT_PRIVATE_KEY is not set");
}
const aiAgentAccount = privateKeyToAccount(aiAgentPrivateKey);

const walletClient = createWalletClient({
  chain: celo,
  transport: http(),
  account: aiAgentAccount,
});

// get the staking pool address from the smart contract
const getStakingPoolAddress = async () => {
  const stakingPoolAddress = await publicClient.readContract({
    address: intelContractAddress,
    abi: intelAbi,
    functionName: "moolaMarketProxy",
  });
  return stakingPoolAddress;
};

// function to stake to a staking pool i.e from smart contract to staking pool
export const agentStakeToPool = async (addresses: string[]) => {
  try {
    const stakingPoolAddress = await getStakingPoolAddress();
    const tx = await walletClient.writeContract({
      address: intelContractAddress,
      abi: intelAbi,
      functionName: "stakeInBestPool",
      args: [stakingPoolAddress],
    });
    const unemailedUsers = await getUnemailedUsers(addresses);
    for (const userEmail of unemailedUsers) {
      await sendStakingEmail(userEmail);
    }
    return tx;
  } catch (error) {
    console.log(error);
    return null;
  }
};
