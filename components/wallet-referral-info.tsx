"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { RewardCountdown } from "./reward-countdown";
import Link from "next/link";

type RefInfo = {
  earnBalance: number;
  earnBalanceUsd: number;
  reward: number;
  rewardUsd: number;
  claimedReward: number;
  claimedRewardUsd: number;
  unclaimedReward: number;
  unclaimedRewardUsd: number;
  participated: Record<string, number>[];
};

export default function WalletReferralInfo() {
  const [refInfo, setRefInfo] = useState<RefInfo>();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey) return;

    const load = async () => {
      const res = await fetch(`https://api.cryptoscan.pro/ref/wallet/${publicKey.toString()}`);
      const data = await res.json();
      if (!data.error) {
        setRefInfo(data);
      }
    };

    load();
  }, [publicKey]);

  return (
    <div>
      <div className="border rounded-md mt-4">
          <Card className="bg-transparent border-none py-3">
            <CardContent className="p-1 px-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-muted-foreground text-sm">Total Rewards</div>
                <div className="text-xl font-bold">{(refInfo?.earnBalance || 0).toFixed(2)} SOL</div>
                <div className="text-xs text-muted-foreground">${(refInfo?.earnBalanceUsd || 0).toFixed(4)}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Unclaimed</div>
                <div className="text-xl font-bold">{(refInfo?.earnBalanceUsd || 0).toFixed(2)} SOL</div>
                <div className="text-xs text-muted-foreground">${(refInfo?.earnBalanceUsd || 0).toFixed(4)}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Claimed Rewards</div>
                <div className="text-xl font-bold">{(0).toFixed(2)} SOL</div>
                <div className="text-xs text-muted-foreground">${(0).toFixed(4)}</div>
              </div>
            </CardContent>
          </Card>
      </div>
      {refInfo?.participated?.length && (
        <div className="mt-2 bg-input/30 border rounded-md px-4 py-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left">
                <th className="py-2">Ref</th>
                <th className="py-2 pr-4">Reward</th>
                <th className="py-2 pr-4">My Volume</th>
                <th className="py-2 pr-4">Volume</th>
                <th className="py-2 pr-4">Reward</th>
                <th className="py-2 pr-4">Traders</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {refInfo.participated?.map((row) => (
                <tr key={row.refId} className="border-t">
                  <td className="py-2">{row.refId}</td>
                  <td className="py-2 pr-4"><RewardCountdown targetDate={new Date(row.rewardAt)} /></td>
                  <td className="py-2 pr-4">${(row.userVolumeUsd).toFixed(2)}</td>
                  <td className="py-2 pr-4">${(row.totalVolumeUsd * row.topRewardUsd).toFixed(2)}</td>
                  <td className="py-2 pr-4">${(row.rewardUsd).toFixed(3)}</td>
                  <td className="py-2 pr-4">{row.tradersCount}</td>
                  <td className="py-2 pr-4 flex gap-2">
                    <Link href={`/referral/${row.refId}`}>
                      <Button size="sm" variant="outline" className="cursor-pointer">
                        Overview
                      </Button>
                    </Link>
                    <Link href={`/?ref=${row.refId}`}>
                      <Button size="sm" variant="outline" className="cursor-pointer">
                        Trade
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
