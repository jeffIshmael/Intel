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

export const GET = async () => {
  try {
    const response = await fetch("https://yields.llama.fi/pools");
    const result = await response.json();

    if (Array.isArray(result.data)) {
      const celoPools = result.data.filter(
        (pool: Pool) => pool.chain?.toLowerCase() === "celo"
      );

      const allStablecoinPools = celoPools.filter(
        (pool: Pool) => pool.stablecoin === true
      );

      // Filter pools whose symbol contains "cUSD"
      const cUSDStableCoins = allStablecoinPools
        .filter((pool: Pool) => pool.symbol && pool.symbol.includes("CUSD"))
        .sort((a: Pool, b: Pool) => {
          if (b.apy !== a.apy) {
            return b.apy - a.apy; // Sort by APY first
          }
          return b.tvlUsd - a.tvlUsd; // If APY is equal, sort by TVL
        });

      // Get best pool: Best pool is the one with the highest APY * TVL
      const best = cUSDStableCoins.reduce((best: Pool, pool: Pool) => {
        const score = pool.apy * pool.tvlUsd;
        return score > (best.apy * best.tvlUsd || 0) ? pool : best;
      }, cUSDStableCoins[0]);

      return NextResponse.json({ allPools: cUSDStableCoins, bestPool: best });
    } else {
      return NextResponse.json({ error: "No pools found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching pools:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
