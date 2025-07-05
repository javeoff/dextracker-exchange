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
}

export interface Coin {
  symbol: string;
  exchange: string;
  address: string;
  liquidity: number;
  market_cap: number;
  volume: number;
}

