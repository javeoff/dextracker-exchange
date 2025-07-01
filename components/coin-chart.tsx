"use client"

import { useParams } from 'next/navigation';
import { TradesChart } from './ui/trades-chart';
import { TradesStats } from './trades-stats';
import { TradesTable } from './trades-table';
import { getQuoteSubscription } from '@/lib/getQuoteSubscription';

export function CoinChart() {
  const { symbol } = useParams();

  const { subscribe } = getQuoteSubscription(symbol as string)

  return (
    <>
      <div className="px-4 border-b">
        <TradesChart
          symbol={symbol as string || 'BTC'}
          history={[]}
          openPositions={[]}
          limitOrders={[]}
          subscribe={subscribe}
          getDepthVolume={() => 0}
        />
        <div className="relative bottom-2">
          <TradesStats
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
