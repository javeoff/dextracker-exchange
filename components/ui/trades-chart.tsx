"use client"

import React, { Dispatch, SetStateAction, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CirclePlusIcon, XIcon } from "lucide-react";
import { BigNumber } from "bignumber.js";
import { toast } from "sonner";
import { getBigNumber } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Chart } from "./candle-chart";
import { formatPrice } from "./price-formatter";
import { Button } from "./button";
import { SelectValue, SelectContent, SelectItem, SelectTrigger, Select } from "@/components/ui/select";

export interface Point {
  timestamp: string;
  ['mexc-futures']: number;
  ['dex']: number;
  spread: number;
}

interface Position {
  symbol: string;
  type: string;
  amount: number;
  openPrice: number;
}

export interface SubscribeData {
  id: string;
  transactions: SubscribeData[];
  symbol: string;
  exchange: string;
  price: number;
  volume: number;
  type: string;
  txn?: string;
  tags?: string[]
  address: string;
  pnl: number;
  bought: number;
  sold: number;
  boughtAt: number;
  pool: string;
}

interface Props {
  exchange: string | undefined;
  setExchange: Dispatch<SetStateAction<string | undefined>>;
  symbol: string;
  openPositions: Position[];
  limitOrders: Position[];
  subscribe: (cb: (data: SubscribeData) => void) => void;
  getDepthVolume: (symbol: string, top?: number, left?: number, display?: string) => number;
}

export function TradesChart({
  exchange,
  setExchange,
  symbol,
  openPositions = [],
  limitOrders = [],
  subscribe,
  getDepthVolume,
}: Props) {
  const [exchanges, setExchanges] = useState(new Set<string>());
  const availableExchangesRef = useRef<Set<string>>(new Set())
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('1m');
  // eslint-disable-next-line 
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!exchange) {
      return;
    }
    localStorage.setItem('dexExchange', exchange);
  }, [exchange])


  useLayoutEffect(() => {
    const loadChart = async () => {
      const timeTo = '0m';
      const network = 'sol';
      const res = await fetch(`https://api.cryptoscan.pro/chart?address=${symbol}&network=${network}&timeTo=${timeTo}&timeframe=${timeframe}`)
      const data = await res.json();
      const newData = data.map((d: Record<string, number | string>) => ({
        ...d,
        time: Math.floor(Number(d.time) / 1000),
        open: Number(d.open),
        close: Number(d.close),
        high: Number(d.high),
        low: Number(d.low),
        volume: Number(d.volume),
      }))
      // setInitialData((prev) => !prev ? newData : prev);
      chartRef.current.setData(newData)
      chartRef.current.reflow();
      // chartRef.current.reflow()
    }
    loadChart();
  }, [symbol, timeframe])

  useEffect(() => {
    if (!chartRef.current) {
      return
    }
    chartRef.current.reflow();
  }, [exchange])

  const currentPriceRef = useRef<number>(null);
  const isHoveredRef = useRef(false);

  const updateElementPosition = useCallback((id: string, price: number) => {
    if (!chartRef.current) return;

    const y = chartRef.current.priceToY(price);
    const element = document.getElementById(id);

    if (element && y !== undefined) {
      element.style.top = `${y - 5}px`;
      element.style.right = '460px';
      element.style.display = 'flex';
    }
  }, [chartRef]);

  useEffect(() => {
    if (!chartRef.current || !symbol) return;

    const existingElements = document.querySelectorAll('[data-order-element]');
    existingElements.forEach(el => el.remove());

    const relevantOrders = limitOrders.filter(order => order.symbol === symbol);

    for (const order of relevantOrders) {
      chartRef.current.addLimitLine(order.type, order.amount, order.openPrice);
    }

    const positionElements = () => {
      for (const order of relevantOrders) {
        const id = `limit-${order.symbol}-${order.type}-${order.openPrice}`;
        updateElementPosition(id, order.openPrice);
      }
    };

    setTimeout(positionElements, 100);

    const unsubscribe = chartRef.current.subscribeToScaleChanges(() => {
      positionElements();
    });

    return () => {
      unsubscribe();
    };
  }, [limitOrders, symbol, updateElementPosition]);

  useEffect(() => {
    if (!chartRef.current || !symbol) return;

    const existingElements = document.querySelectorAll('[data-position-element]');
    existingElements.forEach(el => el.remove());

    const relevantPositions = openPositions.filter(position => position.symbol === symbol);

    for (const position of relevantPositions) {
      chartRef.current.addPositionLine(position.type, position.amount, position.openPrice);
    }

    const positionElements = () => {
      for (const position of relevantPositions) {
        const id = `position-${position.symbol}-${position.type}-${position.openPrice}`;
        updateElementPosition(id, position.openPrice);
      }
    };

    setTimeout(positionElements, 100);

    const unsubscribe = chartRef.current.subscribeToScaleChanges(() => {
      positionElements();
    });

    return () => {
      unsubscribe();
    };
  }, [openPositions, symbol, updateElementPosition]);

  const determinePositionAction = useCallback((price: number) => {
    if (!currentPriceRef.current || !symbol) return null;

    const isAbovePrice = price > currentPriceRef.current;
    const actionType = isAbovePrice ? 'sell' : 'buy';

    const existingPosition = openPositions.find(p => p.symbol === symbol && p.type !== actionType);

    if (existingPosition) {
      return {
        type: actionType,
        isClosing: true,
        existingPosition
      };
    }

    return {
      type: actionType,
      isClosing: false
    };
  }, [openPositions, symbol]);

  const executePositionAction = useCallback(async (price: number) => {
    if (!currentPriceRef.current || !symbol) return;

    const action = determinePositionAction(price);
    if (!action) return;

    // const defaultAmount = 0.01;
    // const amount = action.isClosing ? action.existingPosition?.amount : defaultAmount;

    try {
      toast.loading(`${action.isClosing ? 'Closing' : 'Opening'} ${action.type === 'buy' ? 'long' : 'short'} position...`);
      toast.error(`This function temporary disabled`);
    } catch (error) {
      console.error('Error executing position action:', error);
      toast.error('Error executing trade');
    }
  }, [determinePositionAction, symbol]);

  const [labelPosition, setLabelPosition] = useState({ top: '0px', left: '0px', display: 'none' });
  const [labelPrice, setLabelPrice] = useState<number | undefined>(undefined);

  const onMove = useCallback((price?: number, y?: number, width?: number) => {
    if (isHoveredRef.current) {
      return;
    }

    if (!price || !y || !width) {
      setLabelPosition({ top: '0px', left: '0px', display: 'none' });
      setLabelPrice(undefined);
      return;
    }

    setLabelPosition({
      top: `${y - 12}px`,
      left: `${width - 165}px`,
      display: 'flex'
    });

    setLabelPrice(price);
  }, []);

  useEffect(() => {
    if (!symbol) {
      return
    }
    let exchangeLoaded = false;
    subscribe((data: SubscribeData) => {
      if (availableExchangesRef.current) {
        currentPriceRef.current = data.price;
        setExchanges((prev) => {
          prev.add(data.exchange)
          return prev;
        })
        if (!exchangeLoaded && data.exchange && !exchange) {
          exchangeLoaded = true;
        }
      }
      if (!chartRef.current || !data.price) {
        return
      }
      if (data.exchange === exchange) {
        chartRef.current.addPrice(data.price)
      }
      if (data.exchange !== exchange) {
        chartRef.current.addPriceLine(data.exchange, data.price)
      }
    })
  }, [exchange, symbol, subscribe])

  return (
    <div
      className="relative"
    >
      <div className="relative z-11 flex py-1 px-4 justify-between bg-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setTimeframe('1m')}
              size={null}
              className={"cursor-pointer text-xs text-neutral-500 dark:hover:text-white hover:bg-transparent " + (timeframe === '1m' ? 'text-foreground' : '')}
            >
              1m
            </Button>
            <Button
              variant="ghost"
              onClick={() => setTimeframe('5m')}
              size={null}
              className={"cursor-pointer text-xs text-neutral-500 dark:hover:text-white hover:bg-transparent " + (timeframe === '5m' ? 'text-foreground' : '')}
            >
              5m
            </Button>
            <Button
              variant="ghost"
              onClick={() => setTimeframe('15m')}
              size={null}
              className={"cursor-pointer text-xs text-neutral-500 dark:hover:text-white hover:bg-transparent " + (timeframe === '15m' ? 'text-foreground' : '')}
            >
              15m
            </Button>
            <Button
              variant="ghost"
              onClick={() => setTimeframe('1h')}
              size={null}
              className={"cursor-pointer text-xs text-neutral-500 dark:hover:text-white hover:bg-transparent " + (timeframe === '1h' ? 'text-foreground' : '')}
            >
              1h
            </Button>
          </div>

          <Separator
            orientation="vertical"
            className="data-[orientation=vertical]:h-4"
          />

          <div className="border-neutral-700">
            <Select
              value={exchange}
              onValueChange={setExchange}
            >
              <SelectTrigger className="py-0 px-2 border-0 text-xs" size="sm" style={{ height: '20px', background: 'transparent' }}>
                <SelectValue placeholder="Select Exchange" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(exchanges).map(exchange => (
                  <SelectItem key={exchange} value={exchange} className="text-xs">
                    {exchange}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="overflow-hidden relative bottom-5">
        <Chart
          ref={chartRef}
          initialData={[]}
          onMove={onMove}
        />
        <ChartLabel
          symbol={symbol}
          currentPrice={currentPriceRef.current || undefined}
          executePositionAction={executePositionAction}
          position={labelPosition}
          price={labelPrice}
          getDepthVolume={getDepthVolume}
        />
        <div className="position-markers">
          {limitOrders.filter(order => order.symbol === symbol).map((order) => (
            <div
              className={`absolute z-10 min-w-[100px] bg-[#131722] border flex items-center justify-center px-1 text-xs ${order.type === 'buy' ? 'border-green-500  text-green-300' : 'border-red-500 text-red-300'}`}
              id={`limit-${order.symbol}-${order.type}-${order.openPrice}`}
              key={`limit-${order.symbol}-${order.type}-${order.openPrice}`}
              data-order-element
            >
              <span className="mr-1">Open {order.type === 'buy' ? 'Buy' : 'Sell'}</span>
              <span>${getBigNumber(new BigNumber(order.amount).multipliedBy(order.openPrice).toNumber())}</span>
              <span
                className="cursor-pointer ml-2 pl-1 border-l"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    toast.loading(`Cancelling ${order.type} limit order...`);
                    // Implement your cancel order logic here
                    // This would typically call an API function like cancelMexcOrder
                    toast.success(`Cancelled ${order.type} limit order`);
                  } catch (error) {
                    console.error('Error cancelling order:', error);
                    toast.error('Error cancelling order');
                  }
                }}
              >
                <XIcon width={15} height={15} />
              </span>
            </div>
          ))}

          {openPositions.filter(position => position.symbol === symbol).map((position) => (
            <div
              className={`absolute z-10 min-w-[100px] bg-[#131722] border flex items-center justify-center px-1 text-xs ${position.type === 'buy' ? 'border-green-500 text-green-300' : 'border-red-500 text-red-300'}`}
              key={`position-${position.symbol}-${position.type}-${position.openPrice}`}
              id={`position-${position.symbol}-${position.type}-${position.openPrice}`}
              data-position-element
            >
              <span className="mr-1">Open {position.type === 'buy' ? 'Long' : 'Short'}</span>
              <span>${getBigNumber(new BigNumber(position.amount).multipliedBy(position.openPrice).toNumber())}</span>
              <span
                className="cursor-pointer ml-2 pl-1 border-l"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    toast.loading(`Closing ${position.type === 'buy' ? 'long' : 'short'} position...`);
                    // const result = await executeMexcTrade({
                    //   type: position.type === 'buy' ? 'sell' : 'buy', // Opposite type to close
                    //   symbol: position.symbol,
                    //   amount: position.amount,
                    //   price: currentPriceRef.current || position.openPrice,
                    //   orderType: 'market',
                    //   isClosing: true
                    // });
                    //
                    // if (result.status) {
                    //   toast.success(`Successfully closed ${position.type === 'buy' ? 'long' : 'short'} position`);
                    // } else {
                    //   toast.error('Failed to close position');
                    // }
                  } catch (error) {
                    console.error('Error closing position:', error);
                    toast.error('Error closing position');
                  }
                }}
              >
                <XIcon width={15} height={15} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ChartLabelProps {
  symbol: string;
  currentPrice?: number;
  executePositionAction: (price: number) => void;
  position: {
    top?: string;
    left?: string;
    display?: string;
  };
  price?: number;
  getDepthVolume: (symbol: string, top?: number, left?: number, display?: string) => number;
}

const ChartLabel = React.memo(({
  symbol,
  currentPrice,
  executePositionAction,
  position,
  price,
  getDepthVolume,
}: ChartLabelProps) => {
  const isHoveredRef = useRef(false);
  const depthVolume = getDepthVolume(symbol, Number(position.top), Number(position.left), position.display);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    const customLabel = document.getElementById('label');
    if (customLabel) {
      customLabel.style.display = 'none';
    }
  }, []);

  const handleOpenClick = useCallback(() => {
    if (price) {
      executePositionAction(price);
    }
  }, [executePositionAction, price]);

  const labelContent = useMemo(() => {
    if (!price) return '';

    let volLabel = '';
    if (price) {
      volLabel = `$${getBigNumber(depthVolume)}`;
    }

    let spreadLabel = '';
    if (currentPrice && price) {
      const spread = new BigNumber(currentPrice).div(price).multipliedBy(100).minus(100).toNumber();
      spreadLabel = `(${spread > 0 ? '+' : '-'}${Math.abs(spread).toFixed(1)}%)`;
    }

    return `${formatPrice(price)} ${volLabel} ${spreadLabel}`;
  }, [currentPrice, price, depthVolume]);

  const buttonClass = useMemo(() => {
    if (!price || !currentPrice) return '';
    return price < currentPrice ? 'text-green-500' : 'text-red-500';
  }, [price, currentPrice]);

  return (
    <div
      id="label"
      className="pr-1 flex items-center gap-1 absolute z-50 bg-[#131722] w-[max-content] min-w-[100px] text-white rounded text-xs"
      style={{
        top: position.top || '0px',
        left: position.left || '0px',
        display: position.display || 'none'
      }}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        id="open"
        className={`cursor-pointer py-1 bg-[#0c0e16] px-2 border-r flex items-center ${buttonClass}`}
        onClick={handleOpenClick}
      >
        <CirclePlusIcon width={15} height={15} />
      </div>
      <div className="w-full">
        <span>{labelContent}</span>
      </div>
    </div>
  );
});

ChartLabel.displayName = 'ChartLabel';
