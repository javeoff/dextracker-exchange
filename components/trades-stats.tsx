import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SubscribeData } from "./ui/trades-chart";
import { getBigNumber } from "@/lib/utils";
import { useLogger } from "next-axiom";

interface Props {
  subscribe: (cb: (data: SubscribeData) => void) => void;
  exchange: string | undefined;
  setExchange: Dispatch<SetStateAction<string | undefined>>;
}

export function TradesStats({ subscribe, exchange, setExchange }: Props) {
  const log = useLogger();
  const [stats, setStats] = useState<Record<string, {
    buys: number;
    sells: number;
    net: number;
    exchange: string;
  }>>({});

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    subscribe((data: SubscribeData) => {
      if (!data.exchange) return;

      const volume = data.volume;
      const isBuy = data.type === 'buy';

      setStats((prevStats) => {
        const current = prevStats[data.exchange + data.address] || { buys: 0, sells: 0, net: 0 };

        const updated = isBuy
          ? {
            exchange: data.exchange,
            buys: current.buys + volume,
            sells: current.sells,
            net: current.net + volume,
          }
          : {
            exchange: data.exchange,
            buys: current.buys,
            sells: current.sells + volume,
            net: current.net - volume,
          };

        return {
          ...prevStats,
          [data.exchange + data.address]: updated,
        };
      });

      // Через 5 секунд вычитаем те же данные
      const timer = setTimeout(() => {
        setStats((prevStats) => {
          const current = prevStats[data.exchange + data.address];
          if (!current) return prevStats;

          const updated = isBuy
            ? {
              exchange: data.exchange,
              buys: current.buys - volume,
              sells: current.sells,
              net: current.net - volume,
            }
            : {
              exchange: data.exchange,
              buys: current.buys,
              sells: current.sells - volume,
              net: current.net + volume,
            };

          return {
            ...prevStats,
            [data.exchange + data.address]: updated,
          };
        });
      }, 5000);

      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [subscribe]);

  return (
    <div className="relative flex mt-0 gap-2 h-8 overflow-x-scroll z-10 no-scrollbar">
      {Object.entries(stats).sort((a, b) => Math.abs(b[1].net) - Math.abs(a[1].net)).map(([key, stat]) => (
        <div key={key}>
          <div
            className={"cursor-pointer select-none relative z-1 flex gap-1 items-center w-full text-xs bg-input/30 rounded-sm whitespace-nowrap hover:bg-input/50 border-input/30 h-7"}
            style={{
              border: exchange === stat.exchange ? "1px solid #a1c46e" : undefined
            }}
            onClick={() => {
              log.info('setExchange', { flags: [stat.exchange || 'null', 'stats'] });
              setExchange(stat.exchange)
            }}
          >
            <div className="px-2">
              {stat.exchange}
            </div>
            <div className={`border overflow-hidden rounded-sm h-7 ${stat.net > 3000 ? 'border-green-500/30' : stat.net < -3000 ? 'border-red-500/30' : 'border-input/30'}`}>
              <div className="px-2 h-full text-xs bg-white dark:bg-black">
                <div className={`flex items-center text-[12px] ${Math.ceil(stat.net) > 0 ? 'text-green-600 dark:text-green-300' : Math.ceil(stat.net) < 0 ? 'text-red-600 dark:text-red-300' : ''}`}>
                  {Math.ceil(stat.net) >= 0 ? '' : '-'}${getBigNumber(Math.abs(stat.net))}
                </div>
                <div className="flex gap-1">
                  <div className={`text-[8px] ${stat.buys > 3000 ? 'text-green-300' : ''}`}>
                    ${getBigNumber(Math.abs(stat.buys))}
                  </div>
                  <div className={`text-[8px] ${stat.sells > 3000 ? 'text-red-300' : ''}`}>
                    ${getBigNumber(Math.abs(stat.sells))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))
      }
    </div >
  )
}
