//This file fetches all the available stablecoin pools on Celo
//It is fetching from DeFiLlama API
import { NextResponse } from "next/server";

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
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, 2000)); // Wait before retrying
    }
  }
};

export const GET = async () => {
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
      return NextResponse.json({
        cUSDStableCoins
      });
    } else {
      return NextResponse.json({ error: "No pools found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching pools:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
};

//Using nebula AI to get the best staking pool
//Base URL = https://nebula-api.thirdweb.com
export async function POST(request:Request) {
  const nebulaSecret = process.env.THIRDWEB_SECRET_KEY;
  if (!nebulaSecret) {
    return NextResponse.json({ error: "Secret key not set" }, { status: 500 });
  }
  const requestData = await request.json();

  const pools: Pool[] | null = requestData.stablecoinPools;
  console.log(pools);

 

  if (!pools || pools.length === 0) {
    return NextResponse.json({ error: "No pools found" }, { status: 404 });
  }

  try {
    const formattedPools = pools
      .map((pool) => `- ${pool.pool} (${pool.project}) [${pool.poolMeta || "No ID"}]`)
      .join("\n");

    const response = await fetch("https://nebula-api.thirdweb.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": nebulaSecret,
      },
      body: JSON.stringify({
        message: `Here are the pools I retrieved:\n\n${formattedPools}\n\nFrom the above pools, which pool is the best to stake on? Give just the name with the unique identifier in brackets. Then a reason on the next line.`,
      }),
    });

    const data = await response.json();
    const message = data.message || "";

    // Extract the best pool name and reason
    const match = message.match(/^(.*?) \[(.*?)\]\n(.*)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const bestPool = {
      name: match[1].trim(),
      id: match[2].trim(),
      reason: match[3].trim(),
    };

    return NextResponse.json({ bestPool });
  } catch (error) {
    console.error("Nebula API call failed:", error);
    return NextResponse.json({ error: "API call failed" }, { status: 500 });
  }
}


