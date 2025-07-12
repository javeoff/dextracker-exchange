"use client"

import { TradesChart } from './ui/trades-chart';
import { TradesStats } from './trades-stats';
import { TradesTable } from './trades-table';
import { getQuoteSubscription } from '@/lib/getQuoteSubscription';
import { Dispatch, SetStateAction } from 'react';
import { usePathname } from 'next/navigation';

export function CoinChart({ exchange, setExchange }: {
  exchange: string | undefined
  setExchange: Dispatch<SetStateAction<string | undefined>>
}) {
  const pathname = usePathname();
  const { subscribe } = getQuoteSubscription(pathname.replace("/", ""))

  return (
    <>
      <div className="px-4 border-b">
        <TradesChart
          exchange={exchange}
          setExchange={setExchange}
          symbol={window.location.pathname.replace('/', '') as string || 'BTC'}
          openPositions={[]}
          limitOrders={[]}
          subscribe={subscribe}
          getDepthVolume={() => 0}
        />
        <div className="relative bottom-2">
          <TradesStats
            exchange={exchange}
            setExchange={setExchange}
            subscribe={subscribe}
          />
        </div>
      </div>
      <div className="relative bottom-2 px-4">
        <TradesTable
          subscribe={subscribe}
        />
      </div>
    </>
  )
}
