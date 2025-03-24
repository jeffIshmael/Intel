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

  //function to select best pool manually incase the nebula AI fails
export function getFallbackPool(pools:Pool[]) {
    if (!pools || pools.length === 0) return null;
  
    // Filter out invalid pools (null or zero APY)
    const validPools = pools.filter((pool) => pool.apy !== null && pool.apy > 0);
  
    // Sort pools by APY (descending), then by TVL if APYs are equal
    validPools.sort((a, b) => {
      if (b.apy !== a.apy) {
        return b.apy - a.apy; // Higher APY first
      }
      return b.tvlUsd - a.tvlUsd; // Higher TVL as a tiebreaker
    });
  
    // Return the best pool based on the sorting
    return validPools.length > 0 ? validPools[0] : pools[0]; // Default to first pool if no valid APY pools
  }