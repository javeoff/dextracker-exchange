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
  const { domain } = useWalletDomain(publicKey || undefined)
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!publicKey) {
      return
    }
    localStorage.setItem('walletAddress', publicKey.toString())
  }, [publicKey])

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;

      if (!node || node.contains(event.target as Node)) return;

      setDropdownOpen(false);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  const [balance, setBalance] = useState<number>();

  useEffect(() => {
    if (!publicKey) {
      return;
    }
    const loadBalance = async () => {
      setBalance(await getBalance(publicKey))
    }
    const interval = setInterval(() => loadBalance(), 5000);
    return () => {
      clearInterval(interval);
    }
  }, [publicKey])

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
  const content = useMemo(() => {
    if (connecting) return labels["connecting"];
    if (domain) {
      return `${domain.slice(0, 4)}...${domain.slice(-4)}`
    }
    if (wallet)
      return base58
        ? `${base58.slice(0, 4)}...${base58.slice(-4)}`
        : labels["connected"];
    return labels["no-wallet"];
  }, [connecting, wallet, base58, labels, domain]);

  const copyAddress = async () => {
    if (base58) {
      await navigator.clipboard.writeText(base58);
      setCopied(true);
      setTimeout(() => setCopied(false), 400);
    }
  };

  const openModal = () => {
    console.log("openModal");
    setVisible(true);
    setDropdownOpen(false);
  };

  const disconnectWallet = () => {
    disconnect();
    setDropdownOpen(false);
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
            {wallet.adapter.icon && (
              <WalletIcon
                wallet={{
                  icon: wallet.adapter.icon,
                  name: wallet.adapter.name,
                }}
              />
            )}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{content}</span>
              <span className="truncate text-xs">{balance ? `${balance.toFixed(2)} SOL` : 'Loading...'}</span>
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
