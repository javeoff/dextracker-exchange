"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import { DataTable } from "./data-table";
import { cn, getAgo, getBigNumber, getPrice } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ArrowDown, ArrowUp, ArrowUpDown, FilterIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CoinAvatar } from "./CoinAvatar";

interface TrendingItem {
  symbol: string;
  liquidity: number;
  volume: number;
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
          <div
            className={cn("flex flex-col", row.original.rug_ratio >= 0.2 ? 'text-orange-300' : '', row.original.rug_ratio >= 0.5 ? 'text-orange-500' : '', row.original.rug_ratio >= 0.8 ? 'text-red-500' : '')}
          >
            {symbol}
            <div className="text-[10px] text-muted-foreground">
              {row.original.address.slice(0, 5)}...{row.original.address.slice(-3)}
            </div>
          </div >
        </div >
      )
    },
  },
  {
    accessorKey: "age",
    header: "Age",
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
        <div>Liquidity</div>
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
        <div>Vol 24h</div>
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
        <div>Volume</div>
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
        <div>Net</div>
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
        <div>Buys</div>
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
        <div>Sells</div>
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
        <div>TXs</div>
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
    accessorKey: "price_change_percent1m",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <div>1m</div>
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
        <div>5m</div>
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
        <div>1h</div>
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

  useEffect(() => {
    const ws = new WebSocket('wss://api.cryptoscan.pro/trending')
    ws.onmessage = (msg) => {
      const trendingItems = JSON.parse(msg.data)
      setTrending(trendingItems.map((t: Record<string, string | number>) => ({
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
      })))
    }
    return () => {
      ws.close()
    }
  }, [setTrending])

  return (
    <DataTable
      columns={columns}
      data={data}
    />
  )
}
