"use client";
import { WalletModalProvider } from "@/provider/wallet-modal";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import { ModeToggle } from "./mode-toggle";
import { WalletMultiButton } from "./wallet-multi-button";
import { CommandSearch } from "./command-search";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  console.log('pathname', pathname)
  return (
    <div className={`w-full ${pathname !== '/' ? 'border border-b' : ''} fixed top-0 z-5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}>
      <div className="w-full flex justify-between px-5 py-1">
        <div>
        </div>
        <div className="flex gap-2 items-center">
          <CommandSearch />
          <ModeToggle />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-5"
          />
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={[]} autoConnect>
              <WalletModalProvider>
                <WalletMultiButton />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </div>
      </div>
    </div>
  )
}
