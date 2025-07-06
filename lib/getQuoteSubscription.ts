import { SubscribeData } from '@/components/ui/trades-chart';
import memoize from 'memoizee';
import { Coin } from './types';

function createSubscription(symbol: string) {
  const ws = new WebSocket(`wss://api.cryptoscan.pro/quote?symbol=${symbol}`);
  const subscribers = new Set<(data: SubscribeData) => void>();

  let coinsData: SubscribeData | null = null; // Кэш до первого сабскрайба

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    if ('coins' in data) {
      const coin = (data.coins as Coin[]).sort((a, b) => b.liquidity - a.liquidity)[0];
      console.log('coin', coin);
      localStorage.setItem('symbol', coin.symbol);
      localStorage.setItem('dexAddress', coin.address);

      coinsData = data;
    }

    subscribers.forEach((cb) => cb(data));
  };

  return {
    subscribe(cb: (data: SubscribeData) => void) {
      subscribers.add(cb);

      if (coinsData) {
        cb(coinsData);
      }

      return () => subscribers.delete(cb);
    },
    close() {
      ws.close();
      subscribers.clear();
    },
  };
}

export const getQuoteSubscription = memoize(createSubscription);
