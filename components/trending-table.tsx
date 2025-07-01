"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import { DataTable } from "./data-table";
import { getBigNumber, getPrice } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ArrowDown, ArrowUp, ArrowUpDown, FilterIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TrendingItem {
  symbol: string;
  liquidity: number;
  volume: number;
}

const columns: ColumnDef<TrendingItem>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
    cell: ({ row }) => {
      const symbol = row.getValue("symbol") as number;

      return (
        <div className="flex gap-2 items-center">
          {symbol}
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;

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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
    enableSorting: true,
    enableColumnFilter: true,
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue: { min: number; max: number }) => {
      const value = row.getValue(columnId) as string;
      return (filterValue.min ? Number(value) >= filterValue.min : true) &&
        (filterValue.max ? Number(value) <= filterValue.max : true);
    },
    cell: ({ row }) => {
      const volume = row.getValue("volume") as number;
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
    cell: ({ row }) => {
      const net = row.getValue("net") as number;

      return (
        <div className={`flex items-center gap-1 ${net > 0 ? 'text-green-200' : 'text-red-200'}`}>
          ${getBigNumber(net)}
        </div>
      )
    },
  },
  {
    accessorKey: "buys",
    header: "Buys",
    cell: ({ row }) => {
      const buys = row.getValue("buys") as number;

      return (
        <div>
          ${getBigNumber(buys)}
        </div>
      )
    },
  },
  {
    accessorKey: "sells",
    header: "Sells",
    cell: ({ row }) => {
      const sells = row.getValue("sells") as number;

      return (
        <div>
          ${getBigNumber(sells)}
        </div>
      )
    },
  },
  {
    accessorKey: "swaps",
    header: ({ column }) => (
      <div className="relative flex items-center">
        <div>TXs</div>
        <Button
          variant="ghost"
          className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
    cell: ({ row }) => {
      const swaps = row.getValue("swaps") as number;

      return (
        <div className="font-semibold">
          {swaps}
        </div>
      )
    }
  }
]

export function TrendingTable() {
  const [trending, setTrending] = useState<Record<string, TrendingItem>>({});
  const data = useMemo(() => Object.values(trending), [trending])

  useEffect(() => {
    const ws = new WebSocket('wss://api.cryptoscan.pro/trending')
    ws.onmessage = (msg) => {
      const trendingItem = JSON.parse(msg.data)
      if (!trendingItem.symbol) {
        return;
      }
      setTrending((prev) => {
        return { [trendingItem.symbol]: trendingItem, ...prev };
      })
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
