"use client";

import { RefInfo as RefInfoType } from "@/lib/types";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function RefInfo() {
  const refPathname = usePathname();
  const [refInfo, setRefInfo] = useState<RefInfoType>();

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
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted-foreground text-left">
          <th className="py-2 pr-4">Wallet</th>
          <th className="py-2 pr-4">Volume</th>
          <th className="py-2 pr-4">Chance</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(refInfo?.earnSenders).map(([walletAddress, amount]) => (
          <tr key={walletAddress} className="border-t">
            <td className="py-2">{walletAddress.slice(0, 5)}...{walletAddress.slice(-5)}</td>
            <td className="py-2">{amount.toFixed(3)} SOL</td>
            <td className="py-2">{(amount / refInfo.earnBalance.sol * 100).toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
