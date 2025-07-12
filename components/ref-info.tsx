"use client";

import { getBigNumber } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { RewardCountdown } from "./reward-countdown";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Button } from "./ui/button";

interface WalletInfo {
  address: string;
  chance: number;
  volume: number;
  volumeUsd: number;
}

interface RefInfo {
  refId: string;
  address: string;
  reward: number;
  rewardAt: string;
  rewardUsd: number;
  topReward: number;
  topRewardUsd: number;
  totalVolume: number;
  totalVolumeUsd: number;
  tradersCount: number;
  volumeTopPosition: number;
  wallets: WalletInfo[];
}

export function RefInfo() {
  const refPathname = usePathname();
  const [refInfo, setRefInfo] = useState<RefInfo>();

  useEffect(() => {
    const ref = refPathname.replace('/referral/', '')
    if (!ref) {
      return;
    }
    const load = async () => {
      const res = await fetch(`https://api.cryptoscan.pro/ref/${ref}`);
      const data = await res.json();
      setRefInfo(data);
    }
    load();
  }, [setRefInfo, refPathname])

  if (!refInfo) {
    return null;
  }
  return (
    <div>
      <div className="flex justify-between gap-10">
        <div className="flex-1 bg-input/20 rounded-md px-4 py-2 border">
          <div className="text-md font-semibold">
            <span className="text-lg mr-1">#{refInfo.volumeTopPosition + 1}</span> {refInfo.refId}
          </div>
          <div className="text-sm flex flex-col gap-2 mt-2">
            <div><span className="text-muted-foreground mr-2">Spin:</span> <span className="font-semibold"><RewardCountdown targetDate={new Date(refInfo.rewardAt)} /></span></div>
            <div><span className="text-muted-foreground mr-2">Reward:</span> <span className="font-semibold">{refInfo.reward.toFixed(3)} SOL (${getBigNumber(refInfo.rewardUsd)})</span></div>
            {refInfo.volumeTopPosition < 10 && <div><span className="dark:text-yellow-300 text-yellow-500 mr-2">Top 10:</span> <span className="font-semibold">+{refInfo.topReward.toFixed(3)} SOL (${getBigNumber(refInfo.topReward)})</span></div>}
            <div><span className="text-muted-foreground mr-2">Volume:</span><span className="font-semibold">{refInfo.totalVolume.toFixed(3)} SOL (${getBigNumber(refInfo.totalVolumeUsd)})</span></div>
            <div><span className="text-muted-foreground mr-2">Traders:</span> <span className="font-semibold">{refInfo.tradersCount}</span></div>
          </div>
          <div className="mt-4 w-full">
            <Link href={`/?ref=${refInfo.refId}`}>
              <Button size="sm" variant="outline" className="cursor-pointer w-full">
                Start Trade
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 bg-input/20 rounded-md px-4 py-2 border">
          <div className="text-md font-semibold">
            Previous Winners
          </div>
        </div>
      </div>
      <Separator className="w-full my-4" />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground text-left">
            <th className="py-2 pr-2">#</th>
            <th className="py-2 pr-4">Wallet</th>
            <th className="py-2 pr-4">Volume</th>
            <th className="py-2 pr-4">Volume USD</th>
            <th className="py-2 pr-4">Chance</th>
          </tr>
        </thead>
        <tbody>
          {refInfo?.wallets.map((wallet, index) => (
            <tr key={wallet.address} className="border-t">
              <td className="py-2 pr-4 font-semibold text-xs text-center text-muted-foreground">
                <div className="bg-background border rounded-md bg-input/30">
                  #{index + 1}
                </div>
              </td>
              <td className="py-2">{wallet.address.slice(0, 5)}...{wallet.address.slice(-5)}</td>
              <td className="py-2">{wallet.volume.toFixed(3)} SOL</td>
              <td className="py-2">${getBigNumber(wallet.volumeUsd)}</td>
              <td className="py-2">{wallet.chance * 100}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
