import { cn, getBigNumber, getPrice } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { CoinAvatar } from "./CoinAvatar"
import { SubscribeData } from "./ui/trades-chart"
import { useEffect, useRef, useState } from "react";
import { BigNumber } from "bignumber.js";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

function percentDiff(a: number, b: number) {
  if (a === 0 || b === 0) return Infinity;
  return Math.abs((a - b) / a);
}

export function MarketCard({
  market,
  exchange,
  setExchange,
  fromAmount,
  fromAddress,
  fromSymbol,
  setToAmount,
  markets,
}: {
  fromAmount: string | undefined;
  markets: Record<string, SubscribeData>;
  setToAmount: React.Dispatch<React.SetStateAction<string | undefined>>;
  market: SubscribeData;
  exchange: string | undefined;
  fromAddress: string | undefined;
  fromSymbol: string | undefined;
  setExchange: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
  const exchangePrice = exchange ? markets[exchange]?.price : undefined;
  const minPrice = exchangePrice ? Math.min(market.price, exchangePrice) : undefined;
  const maxPrice = exchangePrice ? Math.max(market.price, exchangePrice) : undefined;
  const spread = exchangePrice ? new BigNumber(markets[market.exchange].price).div(exchangePrice).multipliedBy(100).minus(100).toFixed(1) : '0';
  const [usd, setUsd] = useState<number>();
  const prevMinRef = useRef<number>(undefined);
  const prevMaxRef = useRef<number>(undefined);
  const prevExchange = useRef<string>(undefined);

  useEffect(() => {
    if (minPrice === undefined || maxPrice === undefined || !market?.symbol) return;

    const prevMin = prevMinRef.current;
    const prevMax = prevMaxRef.current;

    const minChanged = prevMin === undefined || percentDiff(prevMin, minPrice) > 0.01;
    const maxChanged = prevMax === undefined || percentDiff(prevMax, maxPrice) > 0.01;

    if ((!spread || Math.abs(Number(spread)) < 0.5) && prevExchange.current === exchange) {
      prevMinRef.current = undefined;
      prevMaxRef.current = undefined;
      prevExchange.current = exchange;
      setUsd(undefined);
      return
    }

    prevExchange.current = exchange;

    if (!minChanged && !maxChanged) {
      return;
    }

    prevMinRef.current = minPrice;
    prevMaxRef.current = maxPrice;

    const loadUsd = async () => {
      const res = await fetch(`https://api.cryptoscan.pro/depth?exchange=${market.exchange}&symbol=${market.symbol}&from=${getPrice(minPrice)}&to=${getPrice(maxPrice)}`);
      const data = await res.json();
      setUsd(data.totalVolumeUSD);
    }

    loadUsd();
  }, [exchangePrice, minPrice, maxPrice, exchange, market, spread]);

  return (
    <div
      className={
        cn(
          "select-none cursor-pointer hover:bg-muted flex items-center justify-between gap-1 bg-input/30 px-3 py-1 rounded border",
          market.exchange === exchange ? ' border-[#a1c46e]' : ''
        )
      }
      onClick={() => {
        setExchange(market.exchange !== exchange ? market.exchange : undefined)
        if (fromAmount && exchange) {
          setToAmount(new BigNumber(fromAmount).div(markets[market.exchange]?.price).toFixed())
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="text-xs font-semibold flex gap-1 items-center">
            <span>1</span>
            <CoinAvatar
              className="border rounded-full inline-flex items-center justify-center w-6 h-6 text-[10px]"
              address={fromAddress || fromSymbol!} width={15} height={15}
            />
            <span>≈</span>
            <span>{getPrice(1 / market.price)}</span>
            <CoinAvatar
              className="border rounded-full inline-flex items-center justify-center w-6 h-6 text-[10px]"
              address={market?.address || market.symbol!} width={15} height={15}
            />
          </div>
        </div>
        <div>
          <div className="text-xs font-bold flex gap-1 items-center">
            ${getPrice(market.price, true)}
            {' '}
            {exchange && !!markets[exchange] && (
              <span className="font-medium text-muted-foreground">
                (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="hover:underline">{spread}%</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Price % difference between {market.exchange} and {exchange}
                  </TooltipContent>
                </Tooltip>
                {usd !== undefined && (
                  <>
                    {"≈"}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="hover:underline">${getBigNumber(usd)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Total USD volume between {market.exchange} and {exchange}
                      </TooltipContent>
                    </Tooltip>
                  </>
                )})
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 items-end">
        <div className="overflow-x-scroll no-scrollbar whitespace-nowrap flex items-center gap-1 bg-background rounded-lg border text-[11px] w-max px-2 py-[1px] font-semibold text-foreground/80 relative left-2">
          <div className="rounded-full w-3 h-3">
            <Avatar>
              <AvatarImage src={`/${market.exchange}.png`} />
              <AvatarFallback>{market.exchange.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </div>
          {market.exchange}
        </div>
        <div className="text-xs font-bold flex gap-1 items-center text-[#69991b] dark:text-[#c8f284]">
          0% FEE
        </div>
      </div>
    </div>
  )
}
