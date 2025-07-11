import { SubscribeData } from '@/components/ui/trades-chart';
import memoize from 'memoizee';
import { Coin } from './types';

function createSubscription(address: string) {
  const ws = new WebSocket((process.env.DEV_ENDPOINT || 'wss://api.cryptoscan.pro/') + `quote?symbol=${address}`);
  const subscribers = new Set<(data: SubscribeData) => void>();

  let lastData: SubscribeData | null = null;

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    console.log('data1', data)

    if ('coins' in data) {
      const coin = (data.coins as Coin[]).sort((a, b) => b.liquidity - a.liquidity)[0];
      console.log('coin', coin);
      localStorage.setItem('symbol', coin.symbol);
      localStorage.setItem('dexAddress', coin.address);
    }

    lastData = data;

    subscribers.forEach((cb) => {
      try {
        cb(data)
      } catch (e) {
        console.warn(e)
      }
    });
  };

  return {
    subscribe(cb: (data: SubscribeData) => void) {
      subscribers.add(cb);

      if (lastData) {
        cb(lastData);
      }

      return () => subscribers.delete(cb);
    },
    close() {
      ws.close();
      subscribers.clear();
    },
  };
}

export const getQuoteSubscription = memoize(() => createSubscription(window.location.pathname.replace("/", "")));
