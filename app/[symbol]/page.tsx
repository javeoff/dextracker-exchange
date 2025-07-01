"use client";

import { CoinChart } from "@/components/coin-chart";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { SidebarRight } from "@/components/sidebar-right";
import { useState, useEffect } from "react";
import { getQuoteSubscription } from "@/lib/getQuoteSubscription";


export default function Page() {
  const path = usePathname()
  const [symbol, setSymbol] = useState<string>();
  const { subscribe } = getQuoteSubscription(path.replace('/', ''));

  useEffect(() => {
    const unsubscribe = subscribe((data) => {
      setSymbol((prev) => !prev ? data.symbol : prev)
    })
    return () => {
      unsubscribe()
    }
  }, [subscribe, setSymbol])

  return (
    <>
      <SidebarInset className="overflow-hidden">
        <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 border border-bottom">
          <div className="flex flex-1 items-center h-10 gap-4 px-4">
            <div className="flex gap-2 items-center">
              <div className="p-2">
                <Avatar>
                  <AvatarImage src="/" />
                  <AvatarFallback>{symbol?.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="h-full flex items-center">
                <div className="font-medium">{symbol}</div>
              </div>
            </div>
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4">
          <CoinChart />
        </div>

      </SidebarInset>
      <SidebarRight />
    </>
  )
}
