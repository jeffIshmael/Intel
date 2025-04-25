// this file has a cron job for checking for best pool and if its differnt from the current, it will reallocate the funds to the best pool

"use server";

const cron = require("node-cron");
import { getCurrentPool, updatePool } from "../lib/functions";
import { getBestPool as getBestPoolFromNebula } from "@/scripts/Nebula.mjs";

interface Pool {
  apy: number;
  apyBase: number;
  apyBase7d: number;
  apyBaseInception: null;
  apyMean30d: number;
  apyPct1D: number;
  apyPct7D: number;
  apyPct30D: number;
  apyReward: null;
  chain: string;
  count: number;
  exposure: string;
  il7d: null;
  ilRisk: string;
  mu: 5.33035;
  outlier: boolean;
  pool: string;
  poolMeta: string;
  project: string;

  stablecoin: boolean;
  symbol: string;
  tvlUsd: number;
  underlyingTokens: [];
  volumeUsd1d: number;
  volumeUsd7d: number;
}

const fetchWithRetry = async (url: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { method: "GET", cache: "no-store" });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, 2000)); // Wait before retrying
    }
  }
};

// function to get all pools that are cUSD based
const getAllPools = async () => {
  try {
    const result = await fetchWithRetry("https://yields.llama.fi/pools");

    if (Array.isArray(result.data)) {
      // Filter pools for Celo chain
      const celoPools = result.data.filter(
        (pool: Pool) => pool.chain?.toLowerCase() === "celo"
      );

      // Filter for all stablecoin pools
      const allStablecoinPools = celoPools.filter(
        (pool: Pool) => pool.stablecoin === true
      );

      // Filter for CUSD stablecoin pools
      const cUSDStableCoins = allStablecoinPools
        .filter((pool: Pool) => pool.symbol && pool.symbol.includes("CUSD"))
        .sort((a: Pool, b: Pool) =>
          b.apy !== a.apy ? b.apy - a.apy : b.tvlUsd - a.tvlUsd
        );

      // Return the results
      return cUSDStableCoins;
    } else {
      return null;
    }
  } catch (error) {
    console.log("Error fetching pools:", error);
    return null;
  }
};

// function to get the best pool from the cUSD pools
const getBestPool = async () => {
  try {
    const pools = await getAllPools();
    if (!pools) return null;
    const data = await getBestPoolFromNebula(pools);
    if (!data) {
      return null;
    }
    const match = data.match(/^(.+?) \[(.+?)\]\n(.+)$/);
    if (!match) {
      return null;
    }

    const bestPool = {
      name: match[1].trim(),
      id: match[2].trim(),
      reason: match[3].trim(),
    };
    console.log("Best pool:", bestPool);
    return bestPool;
  } catch (error) {
    console.log("Error fetching best pool:", error);
    return null;
  }
};

// function to reallocate the funds to the best pool
const reallocateFunds = async (poolSpec: string) => {
  console.log("Reallocating funds to:", poolSpec);
  // add the blockchain fnctn here
};

// function to check for the best pool and reallocate the funds to the best pool
const checkForBestPool = async () => {
  try {
    const currentPool = await getCurrentPool();
    const bestPool = await getBestPool();
    if (!currentPool.poolSpec || !bestPool) return;
    if (bestPool.name.toLowerCase() === "uniswap-v3") return;
    if (currentPool.poolSpec !== bestPool.id) {
      await updatePool(bestPool.id, bestPool.name);
      await reallocateFunds(currentPool.poolSpec);
    }
  } catch (error) {
    console.log("Error checking for best pool:", error);
  }
};

// function to run the cron job
const runCronJob = async () => {
  console.log("Running cron job...", new Date().toISOString());
  await checkForBestPool();
};

// run the cron job every 5 minutes
cron.schedule("*/5 * * * *", runCronJob);
