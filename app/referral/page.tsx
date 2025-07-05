"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { formatTimeDifference } from "@/lib/utils";
import { Referral, RefInfo } from "@/lib/types";

export default function Home() {
  const [refInfo, setRefInfo] = useState<RefInfo>();
  const [refs, setRefs] = useState<Referral[]>([]);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [sort, setSort] = useState<string>();

  useEffect(() => {
    const storedRef = localStorage.getItem('ref');
    setRefCode(storedRef);
  }, []);

  useEffect(() => {
    const ref = localStorage?.getItem('ref');
    if (!ref) {
      return;
    }
    const load = async () => {
      const res = await fetch(`https://api.cryptoscan.pro/ref/${ref}`);
      const data = await res.json();
      setRefInfo(data);
    }
    load();
  }, [setRefInfo])

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`https://api.cryptoscan.pro/ref/list?sort=${sort}`);
      const data = await res.json();
      const mapped = data.map((d: Record<string, string | number>) => {
        const registeredAt = new Date(d.registeredAt);
        const spinAt = new Date(registeredAt);
        spinAt.setDate(spinAt.getDate() + 7);
        return {
          ...d,
          registeredAt,
          spinAt,
        };
      });
      setRefs(mapped);
    };

    load();
    const intervalId = setInterval(load, 5000);

    return () => clearInterval(intervalId);
  }, [sort]);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full px-4 py-6 md:py-10 md:px-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 border bg-gradient-to-br from-black/50 via-gray-800/60 to-black/40 backdrop-blur-md rounded-xl shadow-md">
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="p-6 space-y-4">
              <div className="text-sm text-muted-foreground">📩 Your referral code</div>
              <div className="w-max flex items-center gap-2 bg-muted p-1 px-2 rounded-lg text-lg font-semibold">
                {refCode}
                <Button size="icon" variant="ghost">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">💰 Share and Earn</div>
              <div className="w-full md:max-w-xs flex items-center gap-2 bg-muted px-2 py-1 rounded-lg text-sm break-all">
                <div className="truncate">
                  https://cryptoscan.pro?ref={refCode}
                </div>
                <Button size="icon" variant="ghost">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-sm w-full md:max-w-xs">
                <div className="font-medium mb-1">Earn commission by sharing any link with a referral code on the address bar.</div>
              </div>

              <div className="flex flex-col gap-1">
                <Button className="w-full mt-2" variant="outline">
                  View Tutorial
                </Button>
                <Button className="w-full mt-2" disabled={true}>
                  Withdraw (from 0.1 SOL)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-2 space-y-4">
          <div className="flex gap-2 items-center">
            <h2 className="text-2xl font-semibold">Rewards</h2>
            <div className="bg-foreground text-background rounded text-xs py-[2px] px-1">
              20% Comission Rate (X2)
            </div>
          </div>
          <div className="border rounded-md">
            <Card className="bg-transparent border-none py-3">
              <CardContent className="p-1 px-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-muted-foreground text-sm">Total Rewards</div>
                  <div className="text-xl font-bold">{(refInfo?.earnBalance.sol || 0).toFixed(2)} SOL</div>
                  <div className="text-xs text-muted-foreground">${(refInfo?.earnBalance.usd || 0).toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Unclaimed</div>
                  <div className="text-xl font-bold">{(refInfo?.unclaimedEarn.sol || 0).toFixed(2)} SOL</div>
                  <div className="text-xs text-muted-foreground">${(refInfo?.unclaimedEarn.usd || 0).toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Claimed Rewards</div>
                  <div className="text-xl font-bold">{(refInfo?.claimedEarn.sol || 0).toFixed(2)} SOL</div>
                  <div className="text-xs text-muted-foreground">${(refInfo?.claimedEarn.usd || 0).toFixed(4)}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                className="cursor-pointer text-xs h-7"
                variant={sort === "volume" || !sort ? "default" : "outline"}
                onClick={() => setSort("volume")}
              >
                Volume (+10% Top 10)
              </Button>
              <Button
                size="sm"
                className="cursor-pointer text-xs h-7"
                variant={sort === "created" ? "default" : "outline"}
                onClick={() => setSort("created")}
              >
                New Referral
              </Button>
              <Button
                size="sm"
                className="cursor-pointer text-xs h-7"
                variant={sort === "spinAt" ? "default" : "outline"}
                onClick={() => setSort("spinAt")}
              >
                Rewards Soon
              </Button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left">
                  {sort === "volume" && <th className="py-2 pr-2">#</th>}
                  <th className="py-2">Author</th>
                  <th className="py-2 pr-4">Reward Time</th>
                  <th className="py-2 pr-4">Volume</th>
                  <th className="py-2 pr-4">Reward</th>
                  <th className="py-2 pr-4">Traders</th>
                  <th className="py-2 pr-4">Extra Reward</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {refs.map((row, index) => (
                  <tr key={row.refId} className="border-t">
                    {sort === "volume" && (
                      <td className="py-2 pr-4 font-semibold text-xs text-center text-muted-foreground">
                        <div className="bg-background border rounded-md bg-input/30">
                          #{index + 1}
                        </div>
                      </td>
                    )}
                    <td className="py-2">{row.refId}</td>
                    <td className="py-2 pr-4"><RewardCountdown targetDate={row.spinAt} /></td>
                    <td className="py-2 pr-4">${(row.refBalanceUsd / 0.002).toFixed(2)}</td>
                    <td className="py-2 pr-4">${(row.refBalanceUsd).toFixed(2)}</td>
                    <td className="py-2 pr-4">{row.earnSenders ? Object.keys(row.earnSenders).length : 0}</td>
                    <td className="py-2 pr-4">${(row.topBalanceShareUsd || 0).toFixed(2)}</td>
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
        </div>
      </div>
    </Suspense>
  );
}

type Props = {
  targetDate: Date;
};

function RewardCountdown({ targetDate }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span>{formatTimeDifference(targetDate, now)}</span>;
}

