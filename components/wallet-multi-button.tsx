"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRightLeft, ChevronsUpDown, Copy, LogOut } from "lucide-react";
import { WalletIcon } from "@/components/wallet-icon";
import { useWalletModal } from "@/hooks/use-wallet-modal";
import { SidebarMenuButton } from "./ui/sidebar";
import { getBalance } from "@/lib/getBalance";
import { useWalletDomain } from "@/hooks/use-wallet-domain";
import { useTradingWallet } from "@/hooks/use-trading-wallet";
import Image from "next/image";
import { useReferral } from "@/hooks/use-referral";

interface WalletMultiButtonProps {
  labels?: {
    "copy-address": string;
    copied: string;
    "change-wallet": string;
    disconnect: string;
    connecting: string;
    connected: string;
    "has-wallet": string;
    "no-wallet": string;
  };
}

const LOCAL_STORAGE_KEY = "mainWalletAddress";

export function WalletMultiButton({
  labels = {
    "copy-address": "Copy address",
    copied: "Copied",
    "change-wallet": "Change wallet",
    disconnect: "Disconnect",
    connecting: "Connecting...",
    connected: "Connected",
    "has-wallet": "Connect",
    "no-wallet": "Connect",
  },
}: WalletMultiButtonProps) {
  const { publicKey, wallet, disconnect, connecting } = useWallet();
  const { getWallet: getTradingWallet, login } = useTradingWallet();
  const tradingWallet = getTradingWallet();
  const { domain } = useWalletDomain(publicKey || undefined);
  const { setVisible } = useWalletModal();

  useReferral();

  useEffect(() => {
    const savedAddress = localStorage.getItem(LOCAL_STORAGE_KEY);
    console.log('public', savedAddress)
    if (savedAddress) {
      login().then(() => {
        setActiveWalletType("trade");
      });
    } else {
      setActiveWalletType("main");
    }
  }, [login, publicKey]);

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef(null);
  const [activeWalletType, setActiveWalletType] = useState<"main" | "trade">("main");

  const activePublicKey = useMemo(() => {
    if (activeWalletType === "main") return publicKey;
    if (activeWalletType === "trade") return tradingWallet?.publicKey;
    return null;
  }, [activeWalletType, publicKey, tradingWallet]);

  const [balance, setBalance] = useState<number>();
  useEffect(() => {
    if (!activePublicKey) return;
    let cancelled = false;

    async function load() {
      const bal = await getBalance(activePublicKey!);
      if (!cancelled) setBalance(bal);
    }
    load();

    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activePublicKey, setBalance]);

  const base58 = useMemo(() => activePublicKey?.toBase58(), [activePublicKey]);
  const content = useMemo(() => {
    if (connecting) return labels["connecting"];
    if (domain && activeWalletType === "main") {
      return `${domain.slice(0, 4)}...${domain.slice(-4)}`;
    }
    if (base58) {
      return `${base58.slice(0, 4)}...${base58.slice(-4)}`;
    }
    return labels["no-wallet"];
  }, [connecting, base58, domain, activeWalletType, labels]);

  const copyAddress = async () => {
    if (base58) {
      await navigator.clipboard.writeText(base58);
      setCopied(true);
      setTimeout(() => setCopied(false), 400);
    }
  };

  const openModal = () => {
    setVisible(true);
    setDropdownOpen(false);
  };

  const disconnectWallet = () => {
    disconnect();
    setDropdownOpen(false);
  };

  const switchWallet = () => {
    if (activeWalletType === 'main' && tradingWallet?.publicKey) {
      login().then(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, tradingWallet.publicKey.toBase58());
        setDropdownOpen(false);
        setActiveWalletType("trade");
      });
      return;
    }
    if (activeWalletType === "trade") {
      setDropdownOpen(false);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setActiveWalletType("main");
    }
  };

  if (!wallet) {
    return <Button onClick={openModal}>{content}</Button>;
  }

  return (
    <div ref={ref}>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            {activeWalletType === 'trade' && wallet.adapter.icon && (
              <Image src="/icon.png" alt="dt" width={24} height={24} />
            )}
            {activeWalletType === 'main' && wallet.adapter.icon && (
              <WalletIcon wallet={{ icon: wallet.adapter.icon, name: wallet.adapter.name }} />
            )}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{content}</span>
              <span className="truncate text-xs">{balance !== undefined ? `${balance.toFixed(2)} SOL` : "Loading..."}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {base58 && (
            <DropdownMenuItem onClick={copyAddress}>
              <Copy className="mr-2 h-4 w-4" />
              <span>{copied ? labels["copied"] : labels["copy-address"]}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={switchWallet}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            <span>
              {activeWalletType === "main" ? "Switch to Trade Wallet" : "Switch to Main Wallet"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={openModal}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            <span>{labels["change-wallet"]}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnectWallet}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{labels["disconnect"]}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
