//This file fetches all the available stablecoin pools on Celo
//It is fetching from DeFiLlama API
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    const response = await fetch("https://yields.llama.fi/pools");
    const result = await response.json();

    if (Array.isArray(result.data)) {
      const celoPools = result.data.filter(
        (pool: any) => pool.chain?.toLowerCase() === "celo"
      );

      const allStablecoinPools = celoPools.filter(
        (pool: any) => pool.stablecoin === true
      );

      // Filter pools whose symbol contains "cUSD"
      const cUSDStableCoins = allStablecoinPools
        .filter((pool: any) => pool.symbol && pool.symbol.includes("CUSD"))
        .sort((a: any, b: any) => {
          if (b.apy !== a.apy) {
            return b.apy - a.apy; // Sort by APY first
          }
          return b.tvlUsd - a.tvlUsd; // If APY is equal, sort by TVL
        });

      // Get best pool: Best pool is the one with the highest APY * TVL
      const best = cUSDStableCoins.reduce((best: any, pool: any) => {
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
