"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleDollarSignIcon, CloverIcon, Copy } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefInfo } from "@/components/ref-info";

export default function Home() {
  const router = useRouter();
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const storedRef = localStorage.getItem('ref');
    setRefCode(storedRef);
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full px-4 py-6 md:py-10 md:px-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 border rounded-xl shadow-md backdrop-blur-md bg-gradient-to-br 
  dark:from-black/50 dark:via-gray-800/60 dark:to-black/40
  from-gray-500/20 via-white/20 to-gray-500/20">
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="p-6 space-y-4">
              <div className="text-sm text-muted-foreground">📩 Your referral code</div>
              <div className="w-max flex items-center gap-2 bg-muted/60 dark:bg-input/30 p-1 px-2 rounded-lg text-lg font-semibold">
                {refCode}
                <Button size="icon" variant="ghost" className="cursor-pointer">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">💰 Share and Earn</div>
              <div className="w-full md:max-w-xs flex items-center justify-between gap-2 bg-muted/60 dark:bg-input/30 px-2 py-1 rounded-lg text-sm break-all">
                <div className="truncate">
                  https://cryptoscan.pro?ref={refCode}
                </div>
                <Button size="icon" variant="ghost" className="cursor-pointer">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-sm w-full md:max-w-xs">
                <div className="font-medium mb-1 flex items-center gap-2">
                  <div className="w-7 h-7">
                    <CircleDollarSignIcon className="text-blue-400" />
                  </div>
                  Just 100 active traders ≈ $200.000 in monthly trading volume = $400 in earnings.
                </div>
                <div className="font-medium mb-1"></div>
                <div className="font-medium mb-1 flex items-center gap-2">
                  <div className="w-7 h-7">
                    <CloverIcon className="text-green-400" />
                  </div>
                  Extra +$400 reward for weekly roulette by your link
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Button className="w-full mt-2 bg-background/40 cursor-pointer" variant="outline">
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
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="mr-2 cursor-pointer"
            >
              Back
            </Button>
            <h2 className="text-2xl font-semibold">Rewards</h2>
            <div className="bg-foreground text-background rounded text-xs py-[2px] px-1">
              25% Comission Rate
            </div>
          </div>
          <div>
            <RefInfo />
          </div>
        </div>

      </div>
    </Suspense>
  );
}
