"use client"

import { usePathname } from 'next/navigation';
import { TradesChart } from './ui/trades-chart';
import { TradesStats } from './trades-stats';
import { TradesTable } from './trades-table';
import { getQuoteSubscription } from '@/lib/getQuoteSubscription';
import { Dispatch, SetStateAction } from 'react';


export function CoinChart({ exchange, setExchange }: {
  exchange: string | undefined
  setExchange: Dispatch<SetStateAction<string | undefined>>
}) {
  const symbol = usePathname();

  const { subscribe } = getQuoteSubscription(symbol.replace('/', '') as string)

  return (
    <>
      <div className="px-4 border-b">
        <TradesChart
          exchange={exchange}
          setExchange={setExchange}
          symbol={symbol.replace('/', '') as string || 'BTC'}
          openPositions={[]}
          limitOrders={[]}
          subscribe={subscribe}
          getDepthVolume={() => 0}
        />
        <div className="relative bottom-2">
          <TradesStats
            exchange={exchange}
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
