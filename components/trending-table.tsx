"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect, useMemo, useRef } from "react";
import { DataTable } from "./data-table";
import { cn, getAgo, getBigNumber, getFullNetwork, getPrice } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ArrowDown, ArrowUp, ArrowUpDown, FilterIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CoinAvatar } from "./CoinAvatar";
import { TooltipTrigger, TooltipContent, Tooltip } from "./ui/tooltip";
import Image from "next/image"

interface TrendingItem {
  symbol: string;
  exchanges: string[];
  networks: string[];
  liquidity: number;
  volume: number;
  spread: number;
  address: string;
  rug_ratio: number;
  pool_creation_timestamp: string;
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
            </span>
            {!!row.original.address && (
              <div className="text-[10px] text-muted-foreground">
                {row.original.address.slice(0, 5)}...{row.original.address.slice(-3)}
              </div>
            )}
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
          {column.getIsSorted() === "asc" && <ArrowUp size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
          {column.getIsSorted() === "asc" && <ArrowUp size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
          {column.getIsSorted() === "asc" && <ArrowUp size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
      const buys = row.getValue("buys") as number;
      const sells = row.getValue("sells") as number;
      return <div>${getBigNumber(buys + sells)}</div>;
    },
  },
  {
    accessorKey: "net",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>Net</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>USD difference between sells and buys in 1 minute</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
      const net = row.getValue("net") as number;

      return (
        <div className={`flex items-center gap-1 ${net > 0 ? 'text-green-600 dark:text-green-200' : 'text-red-600 dark:text-red-200'}`}>
          ${getBigNumber(net)}
        </div>
      )
    },
  },
  {
    accessorKey: "buys",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>Buys</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>USD buys in 1 minute</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp size={10} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={10} />}
          {!column.getIsSorted() && <ArrowUpDown size={10} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
      const buys = row.getValue("buys") as number;

      return (
        <div className="font-semibold">
          ${getBigNumber(buys)}
        </div>
      )
    }
  },
  {
    accessorKey: "sells",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>Sells</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>USD sells in 1 minute</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp size={10} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={10} />}
          {!column.getIsSorted() && <ArrowUpDown size={10} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
      const sells = row.getValue("sells") as number;

      return (
        <div className="font-semibold">
          ${getBigNumber(sells)}
        </div>
      )
    }
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
          {column.getIsSorted() === "asc" && <ArrowUp size={10} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={10} />}
          {!column.getIsSorted() && <ArrowUpDown size={10} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
    accessorKey: "spread",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>%</div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Price difference between DEX and CEX exchanges</p>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting()}
        >
          {column.getIsSorted() === "asc" && <ArrowUp size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
          {row.getValue("spread") !== undefined && (
            <div className="flex flex-col">
              {(row.getValue("spread") as number).toFixed(1)}%
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
          {column.getIsSorted() === "asc" && <ArrowUp size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
          {column.getIsSorted() === "asc" && <ArrowUp size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
          {column.getIsSorted() === "asc" && <ArrowUp size={16} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={16} />}
          {!column.getIsSorted() && <ArrowUpDown size={16} />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white">
              <FilterIcon size={12} />
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
  const [trending, setTrending] = useState<Record<string, TrendingItem>>({});
  const data = useMemo(() => Object.values(trending), [trending])
  const tableRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const scrollTop = useRef(0);

  useEffect(() => {
    if (tableRef.current) {
      scrollTop.current = tableRef.current.scrollTop;
    }
    setIsLoading(true);
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
          spread: Number(t.spread || 0),
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
  }, [setTrending, setIsLoading])

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
    />
  )
}
