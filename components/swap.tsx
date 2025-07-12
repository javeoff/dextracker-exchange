"use client";

import { ActivityIcon, SettingsIcon, SlidersHorizontalIcon, SparklesIcon, WalletIcon } from "lucide-react";
import { track } from '@vercel/analytics';
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ADDRESS_SYMBOLS, createDuration, getBigNumber, getPrice, SYMBOL_ADDRESSES } from "@/lib/utils";
import { ChangeIcon } from "./ui/change-icon";
import { useState, useEffect, useMemo, Suspense, Dispatch, SetStateAction } from "react";
import { getQuoteSubscription } from "@/lib/getQuoteSubscription";
import { BigNumber } from "bignumber.js";
import { SubscribeData } from "./ui/trades-chart";
import { CoinAvatar } from "./CoinAvatar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { toast } from "sonner";
import { useTradingWallet } from "@/hooks/use-trading-wallet";
import { Coin } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { CommandSearch } from "./command-search";
import { MarketCard } from "./market-card";

const getBalances = async (walletAddress: string) => {
  if (!walletAddress) {
    return;
  }
  const res = await fetch(`https://ultra-api.jup.ag/balances/${walletAddress}`)
  const data = await res.json();
  data['So11111111111111111111111111111111111111112'] = data['SOL'];
  return data;
}

export function Swap({ exchange, setExchange }: { exchange: string | undefined; setExchange: Dispatch<SetStateAction<string | undefined>> }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [slippage, setSlippage] = useState<string>();
  const [priorityFee, setPriorityFee] = useState<string>();
  const displayText = (!slippage && !priorityFee)
    ? "Auto"
    : "Manual";
  const displaySlippage = slippage ? `${slippage}%` : "0.5%";
  const { publicKey: _publicKey, signTransaction } = useWallet();
  const { getWallet } = useTradingWallet();
  const publicKey = getWallet()?.publicKey || _publicKey;
  const [symbol, setSymbol] = useState<string>();
  const [markets, setMarkets] = useState<Record<string, SubscribeData>>({});
  const { subscribe } = getQuoteSubscription(window.location.pathname.replace("/", ""));
  const [fromAmount, setFromAmount] = useState<string>();
  const [toAmount, setToAmount] = useState<string>();
  const query = useSearchParams();
  const [balances, setBalances] = useState<Record<string, { uiAmount: number }>>({});
  const [fromAddress, setFromAddress] = useState<string | undefined>('So11111111111111111111111111111111111111112')
  const [toAddress, setToAddress] = useState<string | undefined>(localStorage.getItem('dexAddress') || undefined);
  const [fromSymbol, setFromSymbol] = useState<string | undefined>(ADDRESS_SYMBOLS[fromAddress!] || symbol)
  const [toSymbol, setToSymbol] = useState<string>();
  const [swapTxn, setSwapTxn] = useState<string>();
  const [inputUsd, setInputUsd] = useState<number>(0);
  const [outputUsd, setOutputUsd] = useState<number>(0);
  const [requestId, setRequestId] = useState<string>();
  const fromBalance = useMemo(() => balances[fromAddress!]?.uiAmount || 0, [fromAddress, balances]);
  const toBalance = useMemo(() => balances[toAddress!]?.uiAmount || 0, [toAddress, balances]);
  const debouncedFromAmount = useDebouncedValue(fromAmount!, 150)

  useEffect(() => {
    if (!subscribe) {
      return;
    }

    const unsubscribe = subscribe((data) => {
      console.log('markets data', data)
      if ('coins' in data) {
        const coin = (data.coins as Coin[]).sort((a, b) => b.liquidity - a.liquidity)[0];
        console.log('coin', coin.symbol)
        setSymbol((prev) => !prev ? coin.symbol : prev)
        setToSymbol((prev) => !prev ? coin.symbol : prev)
        setToAddress((prev) => !prev ? coin.address : prev)
        return;
      }

      if (data.price === undefined) {
        return;
      }

      console.log('markets', data)
      setMarkets((prev) => {
        return {
          ...(prev || {}),
          [data.exchange]: data,
        }
      })
    })

    return () => {
      console.log('markets unsib')
      unsubscribe()
    }
  }, [subscribe, fromAmount])

  useEffect(() => {
    if (!fromAmount || !exchange || !markets[exchange]) {
      return;
    }
    if (fromAddress !== SYMBOL_ADDRESSES.USDC && fromAddress !== SYMBOL_ADDRESSES.USDT) {
      return;
    }
    setToAmount(new BigNumber(fromAmount).div(markets[exchange].price).toFixed())
  }, [markets, exchange, fromAmount, fromAddress])

  useEffect(() => {
    if (exchange && !markets[exchange].address) {
      setSwapTxn(undefined);
      return
    }
    if (!debouncedFromAmount) {
      setToAmount(undefined);
      return;
    }
    const loadPrice = async () => {
      if (!debouncedFromAmount || !toAddress || !Number.isFinite(Number(debouncedFromAmount))) {
        return;
      }
      const a = Number(debouncedFromAmount)
      const params = new URLSearchParams({
        address: toAddress,
        amount: getPrice(fromAddress === SYMBOL_ADDRESSES.SOL ? a * 0.98 : a, 'short'),
      })
      if (fromAddress) {
        params.set('addressFrom', fromAddress)
      }
      if (exchange) {
        params.set('exchange', exchange)
      }
      if (publicKey) {
        params.set('walletAddress', publicKey.toString())
      }
      const ref = query.get('ref');
      if (ref) {
        params.set('ref', ref)
      }
      const getDuration = createDuration()
      const res = await fetch(`https://api.cryptoscan.pro/swap?${params}`)
      const data = await res.json();
      track('quote', {}, { flags: [getDuration(), data?.price ? 'true' : 'false'] });
      const price = data.price;
      setInputUsd(data.inputUsd)
      setOutputUsd(data.outUsd)
      setToAmount(getPrice(new BigNumber(debouncedFromAmount).div(price).toNumber()));
      setSwapTxn(data.transaction);
      setRequestId(data.requestId);
    }
    loadPrice();
    const interval = setInterval(loadPrice, 5000)
    return () => {
      clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, debouncedFromAmount, fromAddress, setToAmount, exchange, toAddress, query])

  useEffect(() => {
    if (!publicKey) {
      return
    }
    getBalances(publicKey.toString()).then(setBalances)
    const interval = setInterval(() => getBalances(publicKey.toString()).then(setBalances), 60_000)
    return () => {
      clearInterval(interval);
    }
  }, [publicKey, swapTxn])

  const sortedMarkets = useMemo(() => {
    return Object.fromEntries(
      Object.entries(markets).sort((a, b) => {
        if (!exchange) {
          return 1;
        }
        const exchangePrice = markets[exchange].price;
        if (!exchangePrice) {
          return 1;
        }
        const aSpread = new BigNumber(exchangePrice).div(a[1].price).multipliedBy(100).minus(100).toNumber();
        const bSpread = new BigNumber(exchangePrice).div(b[1].price).multipliedBy(100).minus(100).toNumber();
        return Math.abs(bSpread) - Math.abs(aSpread);
      })
    )
  }, [markets, exchange])

  const handleTradeClick = async () => {
    if (!swapTxn || !publicKey || !requestId) return;

    try {
      const txnBuffer = Buffer.from(swapTxn, "base64");
      const transaction = VersionedTransaction.deserialize(txnBuffer);
      const signedTransaction = await signTransaction!(transaction);

      const getDuration = createDuration();
      const request = fetch("https://api.cryptoscan.pro/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          txn: Buffer.from(signedTransaction.serialize()).toString("base64"),
          requestId,
        }),
      });
      toast.promise(request, {
        loading: 'Loading...',
        success: () => {
          return `Swap Successful`;
        },
        error: 'Swap Failed',
      });
      const response = await request;

      const result = await response.json();
      track('swap', {}, { flags: [getDuration(), result?.txn ? 'true' : 'false'] });
      getBalances(publicKey.toString()).then(setBalances)
      console.log("Swap submitted:", result);
    } catch (error) {
      console.error("Swap failed:", error);
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="mt-4 lg:py-0 py-4 flex flex-wrap gap-5 md:gap-3 flex-row lg:flex-col justify-between md:justify-initial">
        <div className="no-scrollbar lg:min-w-full sm:min-w-70 min-w-full relative flex flex-col gap-2 bg-background rounded rounded-md p-2 border">
          <div
            className="flex items-center gap-1 select-none cursor-pointer hover:bg-muted/50 border rounded-lg py-1 px-2 w-max text-xs font-semibold text-foreground/80"
            onClick={() => setModalOpen(true)}
          >
            <div className="flex items-center gap-1">
              {displayText === 'Auto' && <SparklesIcon className="text-[#c8f284] h-3 w-3" />}
              {displayText === 'Manual' && <SettingsIcon className="text-muted-foreground h-3 w-3" />}
              {displayText}
            </div>
            {displayText === "Manual" && (
              <>
                <Separator
                  orientation="vertical"
                  className="mx-1 data-[orientation=vertical]:h-3"
                />
                <div className="flex items-center gap-1">
                  <ActivityIcon size={12} />
                  {displaySlippage}
                </div>
              </>
            )}
            <SlidersHorizontalIcon className="ml-1" size={12} />
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Swap Settings</DialogTitle>
                <DialogDescription>
                  Please specify parameters or leave blank for automatic selection.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="slippage" className="text-right text-xs text-muted-foreground">
                    Max Slippage
                  </label>
                  <Input
                    id="slippage"
                    type="number"
                    min={0}
                    step={0.1}
                    className="col-span-3"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    placeholder="0.5%"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="priorityFee" className="text-right text-xs text-muted-foreground">
                    Priority Fee
                  </label>
                  <Input
                    id="priorityFee"
                    type="number"
                    min={0}
                    step={0.1}
                    className="col-span-3"
                    value={priorityFee}
                    onChange={(e) => setPriorityFee(e.target.value)}
                    placeholder="0.0001"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    // Можно добавить валидацию если нужно
                    setModalOpen(false);
                  }}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="h-23 relative px-3 py-3 bg-muted/40 rounded-md w-full border">
            <div className="flex justify-between">
              <div className="text-muted-foreground text-xs">Selling</div>
              <div className="flex gap-1">
                {!!fromSymbol && (
                  <div className="flex gap-1 mr-1 text-xs items-center text-muted-foreground/50">
                    <WalletIcon size={10} />
                    {getBigNumber(fromBalance)} {fromSymbol.length > 5 ? fromSymbol.slice(0, 5) + '...' : fromSymbol}
                  </div>
                )}
                <Button
                  variant="secondary"
                  className="cursor-pointer text-muted-foreground text-xs rounded-sm block h-5 py-0 m-0 px-2"
                  onClick={() => setFromAmount(getPrice(fromBalance / 2))}
                >
                  HALF
                </Button>
                <Button
                  variant="secondary"
                  className="cursor-pointer text-muted-foreground text-xs rounded-sm block h-5 py-0 m-0 px-2"
                  onClick={() => setFromAmount(getPrice(fromBalance * 0.98))}
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="w-full flex justify-between">
              <CommandSearch
                onClick={(coin) => {
                  setFromAddress(coin.id);
                  setFromSymbol(coin.symbol);
                }}
              >
                <div
                  className="mt-2 h-max cursor-pointer select-none bg-muted hover:bg-muted/50 rounded w-max py-1 px-2 flex items-center gap-1 font-semibold text-sm"
                >
                  <div>
                    {!!fromAddress && (
                      <CoinAvatar address={fromAddress!} width={15} height={15} />
                    )}
                  </div>
                  {fromSymbol}
                </div>
              </CommandSearch>
              <div className="relative bottom-1 h-max flex-1">
                <input
                  className="focus:outline-none text-right w-full border-none bg-transparent py-2 text-2xl font-bold"
                  placeholder="0.00"
                  onChange={(e) => {
                    setFromAmount(e.currentTarget.value ? e.currentTarget.value : undefined)
                  }}
                  value={fromAmount !== undefined ? String(fromAmount) : ''}
                />
              </div>
            </div>
            <div className="absolute right-3 bottom-2 text-muted-foreground text-[10px]">
              ${inputUsd ? getPrice(inputUsd) : 0}
            </div>
          </div>

          <div className="-my-5 w-full flex items-center justify-center">
            <div
              className="w-8 h-8 flex items-center justify-center rounded-full border cursor-pointer text-muted-foreground hover:text-[#c8f284] border-3 border-background hover:border-[#c8f284] z-10 bg-muted"
              onClick={() => {
                setFromAddress(toAddress);
                setToAddress(fromAddress);
                setFromSymbol(toSymbol!);
                setToSymbol(fromSymbol!);
                setFromAmount(getPrice(Number(toAmount!)));
                setToAmount(getPrice(Number(fromAmount!)));
              }}
            >
              <ChangeIcon />
            </div>
          </div>

          <div className="h-23 relative px-3 py-3 bg-transparent rounded-md w-full border">
            <div className="flex justify-between">
              <div className="text-muted-foreground text-xs">Buying</div>
              <div className="flex gap-1">
                <div className="flex gap-1 mr-1 text-xs items-center text-muted-foreground/50">
                  <WalletIcon size={10} />
                  {getBigNumber(toBalance)} {toSymbol}
                </div>
              </div>
            </div>
            <div className="w-full flex justify-between">
              <CommandSearch
                onClick={(coin) => {
                  setToAddress(coin.id);
                  setToSymbol(coin.symbol);
                }}
              >
                <div
                  className="mt-2 h-max cursor-pointer select-none bg-muted hover:bg-muted/50 rounded w-max py-1 px-2 flex items-center gap-1 font-semibold text-sm"
                >
                  <div>
                    {!!toAddress && (
                      <CoinAvatar address={toAddress!} width={15} height={15} />
                    )}
                  </div>
                  {toSymbol}
                </div>
              </CommandSearch>
              <div className="relative bottom-1 h-max flex-1">
                <input
                  className="focus:outline-none text-right w-full border-none bg-transparent py-2 text-2xl font-bold"
                  placeholder="0.00"
                  onChange={(e) => setToAmount(e.currentTarget.value ? e.currentTarget.value : undefined)}
                  value={toAmount ? toAmount : ''}
                />
              </div>
            </div>
            <div className="absolute right-3 bottom-2 text-muted-foreground text-[10px]">
              ${outputUsd ? getPrice(outputUsd) : 0}
            </div>
          </div>
          <div className="w-full mt-2">
            <Button
              className="w-full h-9 bg-[#80c116] dark:bg-[#c8f284] hover:bg-[#69991b] dark:hover:bg-[#a1c46e] cursor-pointer"
              disabled={!swapTxn}
              onClick={handleTradeClick}
            >
              {(!exchange || markets[exchange]?.address) && 'Trade'}
              {exchange && !markets[exchange]?.address && 'CEX will released soon'}
            </Button>
          </div>
        </div>
        {!!exchange && (
          <MarketCard
            setExchange={setExchange}
            exchange={exchange}
            markets={markets}
            market={markets[exchange]}
            fromAddress={fromAddress}
            fromSymbol={fromSymbol}
            fromAmount={fromAmount}
            setToAmount={setToAmount}
          />
        )}
        <div className="px-6">
          <Separator />
        </div>
        <div className="min-w-50 flex flex-1 flex-col gap-2 my-0 lg:my-0 overflow-scroll max-h-80 lg:border-none border lg:p-0 p-3 rounded lg:max-h-full w-full">
          {Object.values(sortedMarkets)
            .filter((market) => market.exchange !== exchange)
            .map((market) => (
              <MarketCard
                key={market.exchange}
                setExchange={setExchange}
                exchange={exchange}
                markets={markets}
                market={market}
                fromAddress={fromAddress}
                fromSymbol={fromSymbol}
                fromAmount={fromAmount}
                setToAmount={setToAmount}
              />
            ))}
        </div>
      </div >
    </Suspense>
  )
}
