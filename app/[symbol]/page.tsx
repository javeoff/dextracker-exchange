"use client"
import { CoinChart } from "@/components/coin-chart";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarRight } from "@/components/sidebar-right";
import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { getQuoteSubscription } from "@/lib/getQuoteSubscription";
import { Swap } from "@/components/swap";
import { CoinAvatar } from "@/components/CoinAvatar";
import { WalletModalProvider } from "@/provider/wallet-modal";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { cn, getBigNumber } from "@/lib/utils";
import { Coin } from "@/lib/types";
import { usePathname } from "next/navigation";

export default function Page() {
  const pathname = usePathname();
  const { subscribe } = getQuoteSubscription(pathname.replace("/", ""));
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const [exchange, setExchange] = useState<string>();
  const [coin, setCoin] = useState<Coin>();
  const firstExchangeLoaded = useRef(false);

  useLayoutEffect(() => {
    const unsubscribe = subscribe((data) => {
      if ('coins' in data) {
        const coin = (data.coins as Coin[]).sort((a, b) => b.liquidity - a.liquidity)[0];
        setCoin(coin)
        return;
      }
      if (!data.price) {
        return;
      }
      if (!data.boughtAt && data.address && !firstExchangeLoaded.current) {
        setExchange((prev) => !prev ? data.exchange : prev);
        firstExchangeLoaded.current = true;
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <SidebarInset className="overflow-hidden md:mt-0 mt-15 md:mt-0">
            <header
              className={cn(
                "z-20 flex h-14 shrink-0 items-center gap-2 border-b transition-all duration-200",
                "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
              )}
            >
              <div className="flex flex-1 items-center h-10 mt-1 gap-4 px-4">
                <div className="flex gap-2 items-center">
                  {coin && (
                    <>
                      <div className="px-2">
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
                        <div className="font-medium text-sm">${getBigNumber('stats24h' in coin ? (coin.stats24h.buyVolume + coin.stats24h.sellVolume) : (coin as Coin).volume)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 my-1 md:my-o">
              <div className="block lg:hidden px-4">
                <Swap
                  exchange={exchange}
                  setExchange={setExchange}
                />
              </div>

              <CoinChart
                exchange={exchange}
                setExchange={setExchange}
              />
            </div>
          </SidebarInset>

          <SidebarRight
            exchange={exchange}
            setExchange={setExchange}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
