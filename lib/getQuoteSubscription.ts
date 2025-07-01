import { SubscribeData } from '@/components/ui/trades-chart';
import memoize from 'memoizee';

function createSubscription(symbol: string) {
  localStorage.setItem('symbol', symbol);
  const ws = new WebSocket(`wss://api.cryptoscan.pro/quote?symbol=${symbol}`);
  const subscribers = new Set<(data: SubscribeData) => void>();

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.network === 'sol') {
      localStorage.setItem('dexAddress', data.address);
    }
    if (data?.price) {
      subscribers.forEach((cb) => cb(data));
    }
  };

  return {
    subscribe(cb: (data: SubscribeData) => void) {
      subscribers.add(cb);
      return () => subscribers.delete(cb); // отписка
    },
    close() {
      ws.close();
      subscribers.clear();
    },
  };
}

export const getQuoteSubscription = memoize(createSubscription);
