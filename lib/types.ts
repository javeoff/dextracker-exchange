export interface RefInfo {
  earnSenders: Record<string, number>;
  earnBalance: {
    sol: number;
    usd: number
  }
  unclaimedEarn: {
    sol: number;
    usd: number
  }
  claimedEarn: {
    sol: number;
    usd: number
  }
}

export interface Referral {
  refBalanceUsd: number;
  refId: string;
  earnSenders: Record<string, number>;
  spinAt: Date;
  topBalanceShareUsd: number;
  rewardAt: string;
  totalVolumeUsd: number;
  rewardUsd: number;
  tradersCount: number;
  topRewardUsd: number;
}

export interface Coin {
  id: string;
  cexes: string[];
  liquidity: number;
  mcap: number;
  symbol: string;
  name: string;
  icon: string;
  exchange: string;
  address: string;
  market_cap: number;
  volume: number;
  stats24h: {
    buyVolume: number;
    sellVolume: number;
  }
}

