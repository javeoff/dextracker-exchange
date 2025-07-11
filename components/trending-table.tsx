"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { DataTable } from "./data-table";
import { cn, getAgo, getBigNumber, getFullNetwork, getPrice } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ArrowDown, ArrowUp, ArrowUpDown, BotIcon, BrainIcon, CrosshairIcon, FilterIcon, UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CoinAvatar } from "./CoinAvatar";
import { TooltipTrigger, TooltipContent, Tooltip } from "./ui/tooltip";
import Image from "next/image";

interface TrendingItem {
  symbol: string;
  exchanges: string[];
  networks: string[];
  liquidity: number;
  volume: number;
  address: string;
  rug_ratio: number;
  pool_creation_timestamp: string;
  buys: number;
  sells: number;
  net: number;
  top_10_holder_rate: number;
  sniper_count: number;
  holder_count: number;
  smart_degen_count: number;
}

const columns: ColumnDef<TrendingItem>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
    cell: ({ row }) => {
      const symbol = row.getValue("symbol") as number;

      return (
        <div className="flex gap-4 items-center">
          <CoinAvatar
            address={row.original.address}
            width={32}
            height={32}
          />
          <div className="flex -ml-4 mt-4 z-10">
            {row.original.networks?.map((n, idx) => (
              <div
                key={idx}
                className="w-[14px] h-[14px] -ml-2"
              >
                <Image
                  className="border rounded rounded-full bg-muted"
                  alt={n}
                  src={"/" + getFullNetwork(n) + ".png"}
                  width={14}
                  height={14}
                />
              </div>
            ))}
          </div>
          <div
            className={cn("flex flex-col", row.original.rug_ratio >= 0.2 ? 'text-orange-300' : '', row.original.rug_ratio >= 0.5 ? 'text-orange-500' : '', row.original.rug_ratio >= 0.8 ? 'text-red-500' : '')}
          >
            <span className="flex gap-1">
              {symbol}
              <div className="flex">
                {row.original.exchanges?.slice(0, 5)?.map((e, i) => (
                  <div
                    key={e}
                    className={`w-[14px] h-[14px] bg-muted rounded-full border overflow-hidden ${i !== 0 ? '-ml-1' : ''
                      }`}
                  >
                    <Image src={`/${e}.png`} alt={e} width={14} height={14} />
                  </div>
                ))}
                {row.original.exchanges?.length > 5 && (
                  <div
                    className="-ml-2 w-[14px] h-[14px] bg-muted border rounded-full text-[6px] text-center leading-[14px] flex-shrink-0"
                    style={{ zIndex: 0 }}
                  >
                    +{row.original.exchanges.length - 5}
                  </div>
                )}
              </div>
              {!!row.original.address && (
                <div className="text-[10px] text-muted-foreground">
                  {row.original.address.slice(0, 5)}...{row.original.address.slice(-3)}
                </div>
              )}
            </span>
            <div className="flex gap-1 mt-[2px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "text-[10px] px-1 py-0 bg-input/20 rounded rounded-sm border border-input/40 flex items-center gap-[2px]",
                    row.original.rug_ratio < 0.2 ? "text-green-800 bg-green-200/70 dark:text-green-300 dark:bg-green-800/10" : "text-red-800 bg-red-200/70 dark:text-red-300 dark:bg-red-800/10"
                  )}>
                    <div className="w-[12px] h-[12px]">
                      <BotIcon className="w-[12px] h-[12px]" />
                    </div>
                    {(row.original.rug_ratio * 100).toFixed()}%
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Rug pull % chance</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "text-[10px] px-1 py-0 bg-input/20 rounded rounded-sm border border-input/40 flex items-center gap-[2px]",
                    row.original.top_10_holder_rate < 0.2 ? "text-green-800 bg-green-200/70 dark:text-green-300 dark:bg-green-800/10" : "text-red-800 bg-red-200/70 dark:text-red-300 dark:bg-red-800/10"
                  )}>
                    <div className="w-[12px] h-[12px]">
                      <UserIcon className="w-[12px] h-[12px]" />
                    </div>
                    {(row.original.top_10_holder_rate * 100).toFixed()}%
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Top 10 holders %</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "text-[10px] px-1 py-0 bg-input/20 rounded rounded-sm border border-input/40 flex items-center gap-[2px]",
                    row.original.sniper_count / row.original.holder_count < 0.2 ? "text-green-800 bg-green-200/70 dark:text-green-300 dark:bg-green-800/10" : "text-red-800 bg-red-200/70 dark:text-red-300 dark:bg-red-800/10"
                  )}>
                    <div className="w-[12px] h-[12px]">
                      <CrosshairIcon className="w-[12px] h-[12px]" />
                    </div>
                    {(row.original.sniper_count / row.original.holder_count * 100).toFixed()}%
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Snipers % ratio</p>
                </TooltipContent>
              </Tooltip>
              {row.original.smart_degen_count / row.original.holder_count * 100 > 0.1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn(
                      "text-[10px] px-1 py-0 bg-input/20 rounded rounded-sm border border-input/40 flex items-center gap-[2px] text-foreground/60",
                    )}>
                      <div className="w-[12px] h-[12px]">
                        <BrainIcon className="w-[12px] h-[12px] text-pink-300" />
                      </div>
                      {(row.original.smart_degen_count / row.original.holder_count * 100).toFixed(1)}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Smart wallets % ratio</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "text-[10px] px-1 py-0 bg-input/20 rounded rounded-sm border border-input/40",
                    row.original.buys - row.original.sells > 0 ? "text-green-800 bg-green-200/70 dark:text-green-300 dark:bg-green-800/10" : "text-red-800 bg-red-200/70 dark:text-red-300 dark:bg-red-800/10"
                  )}>
                    ${getBigNumber(row.original.buys - row.original.sells)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Difference between buys and sells in USD</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div >
        </div >
      )
    },
  },
  {
    accessorKey: "age",
    header: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>Age</div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>How many time ago was token created</p>
        </TooltipContent>
      </Tooltip>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            {getAgo(new Date(Number(row.original.pool_creation_timestamp) * 1000), true)}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;

      if (!price) {
        return null;
      }

      return (
        <div className="text-muted-foreground">
          ${getPrice(price)}
        </div>
      )
    },
  },
  {
    accessorKey: "market_cap",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>MCap</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Market Capitalization is a USD value of all exchanges</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp className="text-foreground" size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown className="text-foreground" size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="-mx-1 cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              {!column.getFilterValue() && <FilterIcon size={11} />}
              {!!column.getFilterValue() && <FilterIcon className="text-foreground" size={12} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.min}
                onChange={(e) => {
                  const prev = column.getFilterValue() as { min: number; max: number } || {};
                  column.setFilterValue({
                    ...prev,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.max}
                onChange={(e) => {
                  const prev = column.getFilterValue() as { min: number; max: number } || {};
                  column.setFilterValue({
                    ...prev,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div >
    ),
    enableColumnFilter: true,
    sortDescFirst: true,
    filterFn: (row, columnId, filterValue: { min: number; max: number }) => {
      const value = row.getValue(columnId) as string;
      return (filterValue.min ? Number(value) >= filterValue.min : true) &&
        (filterValue.max ? Number(value) <= filterValue.max : true);
    },
    cell: ({ row }) => {
      const marketCap = row.getValue("market_cap") as number;
      return <div>${getBigNumber(marketCap)}</div>;
    },
  },
  {
    accessorKey: "liquidity",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>Liquidity</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Amount of USD used for trading between USD and token</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp className="text-foreground" size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown className="text-foreground" size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="-mx-1 cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              {!column.getFilterValue() && <FilterIcon size={11} />}
              {!!column.getFilterValue() && <FilterIcon className="text-foreground" size={12} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.min}
                onChange={(e) => {
                  const prev = column.getFilterValue() as { min: number; max: number } || {};
                  column.setFilterValue({
                    ...prev,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.max}
                onChange={(e) => {
                  const prev = column.getFilterValue() as { min: number; max: number } || {};
                  column.setFilterValue({
                    ...prev,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div >
    ),
    enableColumnFilter: true,
    sortDescFirst: true,
    filterFn: (row, columnId, filterValue: { min: number; max: number }) => {
      const value = row.getValue(columnId) as string;
      return (filterValue.min ? Number(value) >= filterValue.min : true) &&
        (filterValue.max ? Number(value) <= filterValue.max : true);
    },
    cell: ({ row }) => {
      const volume = row.getValue("liquidity") as number;
      return <div>${getBigNumber(volume)}</div>;
    },
  },
  {
    accessorKey: "volume24",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>Vol 24h</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Amount of traded USD in 24 hours</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp className="text-foreground" size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown className="text-foreground" size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="-mx-1 cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              {!column.getFilterValue() && <FilterIcon size={11} />}
              {!!column.getFilterValue() && <FilterIcon className="text-foreground" size={12} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.min}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.max}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div >
    ),
    enableSorting: true,
    sortDescFirst: true,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue: { min: number; max: number }) => {
      const value = row.getValue(columnId) as string;
      return (filterValue.min ? Number(value) >= filterValue.min : true) &&
        (filterValue.max ? Number(value) <= filterValue.max : true);
    },
    cell: ({ row }) => {
      const volume = row.getValue("volume24") as number;
      return <div>${getBigNumber(volume)}</div>;
    },
  },
  {
    accessorKey: "volume",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>Volume</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Traded USD in 1 minute</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp className="text-foreground" size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown className="text-foreground" size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="-mx-1 cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              {!column.getFilterValue() && <FilterIcon size={11} />}
              {!!column.getFilterValue() && <FilterIcon className="text-foreground" size={12} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.min}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.max}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div >
    ),
    enableSorting: true,
    sortDescFirst: true,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue: { min: number; max: number }) => {
      const value = row.getValue(columnId) as string;
      return (filterValue.min ? Number(value) >= filterValue.min : true) &&
        (filterValue.max ? Number(value) <= filterValue.max : true);
    },
    cell: ({ row }) => {
      const buys = row.original.buys as number;
      const sells = row.original.sells as number;
      return <div>
        <div>
          ${getBigNumber(buys + sells)}
        </div>
        <div className="flex">
          <span className="text-green-600 dark:text-green-300 text-xs">${getBigNumber(row.original.buys)}</span>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-red-600 dark:text-red-300 text-xs">${getBigNumber(row.original.sells)}</span>
        </div>
      </div>;
    },
  },
  {
    accessorKey: "swaps",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>Txs</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Amount of transactions in 1 minute</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp className="text-foreground" size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown className="text-foreground" size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={10} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="-mx-1 cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              {!column.getFilterValue() && <FilterIcon size={11} />}
              {!!column.getFilterValue() && <FilterIcon className="text-foreground" size={12} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.min}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.max}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div >
    ),
    sortDescFirst: true,
    cell: ({ row }) => {
      const swaps = row.getValue("swaps") as number;

      return (
        <div className="font-semibold">
          {swaps}
        </div>
      )
    }
  },
  {
    accessorKey: "holder_count",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>Hds</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Amount of holders in the coin</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp className="text-foreground" size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown className="text-foreground" size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="-mx-1 cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              {!column.getFilterValue() && <FilterIcon size={11} />}
              {!!column.getFilterValue() && <FilterIcon className="text-foreground" size={12} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.min}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.max}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  })
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div >
    ),
    cell: ({ row }) => {
      return (
        <div className="flex gap-4 items-center">
          {row.getValue("holder_count") !== undefined && (
            <div className="flex flex-col">
              {getBigNumber((row.getValue("holder_count") as number))}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "price_change_percent1m",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>1m</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Price change in 1 minute</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp className="text-foreground" size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown className="text-foreground" size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="-mx-1 cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              {!column.getFilterValue() && <FilterIcon size={11} />}
              {!!column.getFilterValue() && <FilterIcon className="text-foreground" size={12} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.min}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.max}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div >
    ),
    sortDescFirst: true,
    cell: ({ row }) => {
      const change = (row.getValue("price_change_percent1m") || 0) as number;

      return (
        <div className={`flex items-center gap-1 ${change > 0 ? 'text-green-600 dark:text-green-200' : 'text-red-600 dark:text-red-200'}`}>
          {change.toFixed(1)}%
        </div>
      )
    },
  },
  {
    accessorKey: "price_change_percent5m",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>5m</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Price change in 5 minutes</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp className="text-foreground" size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown className="text-foreground" size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="-mx-1 cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              {!column.getFilterValue() && <FilterIcon size={11} />}
              {!!column.getFilterValue() && <FilterIcon className="text-foreground" size={12} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.min}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.max}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div >
    ),
    sortDescFirst: true,
    cell: ({ row }) => {
      const change = (row.getValue("price_change_percent5m") || 0) as number;

      return (
        <div className={`flex items-center gap-1 ${change > 0 ? 'text-green-600 dark:text-green-200' : 'text-red-600 dark:text-red-200'}`}>
          {change.toFixed(1)}%
        </div>
      )
    },
  },
  {
    accessorKey: "price_change_percent1h",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>1h</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Price change in 1 hour</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp className="text-foreground" size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown className="text-foreground" size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="-mx-1 cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              {!column.getFilterValue() && <FilterIcon size={11} />}
              {!!column.getFilterValue() && <FilterIcon className="text-foreground" size={12} />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.min}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                className="border rounded px-2 py-1"
                value={(column.getFilterValue() as { min: number; max: number })?.max}
                onChange={(e) => {
                  const prev = (column.getFilterValue() as { min: number; max: number }) || {};
                  column.setFilterValue({
                    ...prev,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  });
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div >
    ),
    sortDescFirst: true,
    cell: ({ row }) => {
      const change = (row.getValue("price_change_percent1h") || 0) as number;

      return (
        <div className={`flex items-center gap-1 ${change > 0 ? 'text-green-600 dark:text-green-200' : 'text-red-600 dark:text-red-200'}`}>
          {change.toFixed(1)}%
        </div>
      )
    },
  },
]

export function TrendingTable() {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scrollTop = useRef(0);

  useLayoutEffect(() => {
    if (tableRef.current) {
      scrollTop.current = tableRef.current.scrollTop;
    }
    setIsLoading(true);
    const load = async () => {
      const res = await fetch('https://api.cryptoscan.pro/trending/list');
      const data = await res.json();
      const items = Object.values(data) as TrendingItem[];
      console.log('trending loaded')
      // eslint-disable-next-line
      setTrending(items.map((t: any) => {
        return {
          ...t,
          liquidity: Number(t.liquidity),
          volume24: Number(t.volume24),
          volume: Number(t.volume),
          buys: Number(t.buys),
          sells: Number(t.sells),
          net: Number(t.net),
          txs: Number(t.txs),
          price_change_percent1m: Number(t.price_change_percent1m),
          price_change_percent5m: Number(t.price_change_percent5m),
          price_change_percent1h: Number(t.price_change_percent1h),
        }
      }))
    }
    load();
    const ws = new WebSocket((process.env.DEV_ENDPOINT || 'wss://api.cryptoscan.pro/') + 'trending')
    ws.onmessage = (msg) => {
      const trendingItems = JSON.parse(msg.data)
      setIsLoading(false);
      setTrending(trendingItems.map((t: Record<string, string | number>) => {
        delete t.id;

        return {
          ...t,
          liquidity: Number(t.liquidity),
          volume24: Number(t.volume24),
          volume: Number(t.volume),
          buys: Number(t.buys),
          sells: Number(t.sells),
          net: Number(t.net),
          txs: Number(t.txs),
          price_change_percent1m: Number(t.price_change_percent1m),
          price_change_percent5m: Number(t.price_change_percent5m),
          price_change_percent1h: Number(t.price_change_percent1h),
        }
      }))
      requestAnimationFrame(() => {
        if (tableRef.current) {
          tableRef.current.scrollTop = scrollTop.current;
        }
      });
    }
    return () => {
      ws.close()
    }
  }, [])

  return (
    <DataTable
      columns={columns}
      data={trending}
      isLoading={isLoading}
      storageKey="trending"
    />
  )
}
