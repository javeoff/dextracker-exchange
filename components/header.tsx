"use client";

import { WalletModalProvider } from "@/provider/wallet-modal";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { Suspense, useMemo } from "react";
import { ModeToggle } from "./mode-toggle";
import { WalletMultiButton } from "./wallet-multi-button";
import { CommandSearch } from "./command-search";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useTheme } from "next-themes";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { resolvedTheme: theme } = useTheme();
  const pathname = usePathname();
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <div
      className={`w-full ${pathname !== "/" ? "border border-b" : ""
        } fixed top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
    >
      <div className="flex flex-col px-4 py-2 space-y-3 md:hidden">
        <div className="flex justify-between items-center">
          <Link href="https://cryptoscan.pro" className="block">
            <Image src={theme === 'dark' ? "/logo.png" : "/logo-white.png"} alt="logo" width={35} height={12} />
          </Link>

          <NavigationMenu>
            <NavigationMenuList className="flex gap-2">
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="text-sm font-medium hover:underline">
                    Trending
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="https://docs.cryptoscan.pro" target="_blank">
                  <NavigationMenuLink className="text-sm font-medium hover:underline">
                    Docs
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="https://docs.cryptoscan.pro/changelog" target="_blank">
                  <NavigationMenuLink className="text-sm font-medium hover:underline">
                    Changelog
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex justify-between items-center gap-2">
          <div className="flex-1">
            <Suspense fallback={<div>Loading...</div>}>
              <CommandSearch />
            </Suspense>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Separator orientation="vertical" className="h-5" />
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                  <Suspense fallback={<div>Loading...</div>}>
                    <WalletMultiButton />
                  </Suspense>
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </div>
        </div>
      </div>

      <div className="hidden md:flex justify-between px-8 py-1 items-center">
        <div className="flex items-center gap-6">
          <Link href="https://cryptoscan.pro" className="block">
            <Image src={theme === 'dark' ? "/logo.png" : "/logo-white.png"} alt="logo" width={35} height={12} />
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className="px-4 py-2 text-sm font-medium hover:underline">
                    Trending
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="https://docs.cryptoscan.pro" target="_blank">
                  <NavigationMenuLink className="px-4 py-2 text-sm font-medium hover:underline">
                    Docs
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="https://docs.cryptoscan.pro/changelog" target="_blank">
                  <NavigationMenuLink className="px-4 py-2 text-sm font-medium hover:underline">
                    Changelog
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex gap-2 items-center">
          <Suspense fallback={<div>Loading...</div>}>
            <CommandSearch withKeybind={true} />
          </Suspense>
          <Link href="/referral" className="relative rounded-md h-[33px] w-[33px] rainbow-border">
            <Button variant="outline" size="icon" className="absolute top-[1px] rainbow-border-inner left-[1px] border-none h-[31px] w-[31px] dark:bg-[#151515] dark:hover:bg-[#1d1d1d] cursor-pointer">
              <Gift className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all" />
            </Button>
          </Link>
          <ModeToggle />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-5"
          />
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={[]} autoConnect>
              <WalletModalProvider>
                <Suspense fallback={<div>Loading...</div>}>
                  <WalletMultiButton />
                </Suspense>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </div>
      </div>
    </div >
  );
}
