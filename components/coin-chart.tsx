"use client"

import { useParams } from 'next/navigation';
import { TradesChart } from './ui/trades-chart';
import { useCallback } from 'react';

export function CoinChart() {
  const { symbol } = useParams();

  const subscribe = useCallback((cb) => {
    const ws = new WebSocket('wss://api.cryptoscan.pro/quote?symbol=' + symbol)
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      cb(data)
    }
  }, [symbol])

  return (
    <TradesChart
      symbol={symbol as string || 'BTC'}
      history={[]}
      openPositions={[]}
      limitOrders={[]}
      subscribe={subscribe}
      getDepthVolume={() => 0}
      mainExchange={'bitget'}
    />
  )
}
