"use client";

import { CoinChart } from "@/components/coin-chart";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { SidebarRight } from "@/components/sidebar-right";
import { useState, useEffect, useMemo } from "react";
import { getQuoteSubscription } from "@/lib/getQuoteSubscription";
import { Swap } from "@/components/swap";
import { CoinAvatar } from "@/components/CoinAvatar";
import { WalletModalProvider } from "@/provider/wallet-modal";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { getBigNumber } from "@/lib/utils";
import { Coin } from "@/lib/types";

export default function Page() {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const path = usePathname();
  const [coin, setCoin] = useState<Coin>();
  const { subscribe } = getQuoteSubscription(path.replace("/", ""));

  useEffect(() => {
    const unsubscribe = subscribe((data) => {
      if ('coins' in data) {
        const coin = (data.coins as Coin[]).sort((a, b) => b.liquidity - a.liquidity)[0];
        setCoin(coin)
        return;
      }
      if (!data.price) {
        return;
      }
    });
    return () => {
      unsubscribe();
    };
  }, [subscribe, setCoin]);

  if (!coin) {
    return null
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <SidebarInset className="overflow-hidden mt-15 md:mt-0">
            <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 border border-bottom">
              <div className="flex flex-1 items-center h-10 gap-4 px-4">
                <div className="flex gap-2 items-center">
                  <div className="p-2">
                    <CoinAvatar address={coin.address} width={32} height={32} />
                  </div>
                  <div className="h-full flex items-center">
                    <div className="font-medium">{coin.symbol}</div>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                  />
                  <div className="flex gap-1 items-center">
                    <div className="text-muted-foreground text-xs">
                      Liq:
                    </div>
                    <div className="font-medium text-sm">${getBigNumber(coin.liquidity)}</div>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="text-muted-foreground text-xs">
                      Mcap:
                    </div>
                    <div className="font-medium text-sm">${getBigNumber(coin.market_cap)}</div>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="text-muted-foreground text-xs">
                      Vol:
                    </div>
                    <div className="font-medium text-sm">${getBigNumber(coin.volume)}</div>
                  </div>
                </div>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 my-5 md:my-o">
              <div className="block lg:hidden px-4">
                <Swap />
              </div>

              <CoinChart />

            </div>
          </SidebarInset>

          <SidebarRight />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
