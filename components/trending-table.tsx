"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import { DataTable } from "./data-table";

interface TrendingItem {
  symbol: string;
}

const columns: ColumnDef<TrendingItem>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "volume",
    header: "Volume",
  },
  {
    accessorKey: "buys",
    header: "Buys",
  },
  {
    accessorKey: "sells",
    header: "Sells",
  },
  {
    accessorKey: "net",
    header: "Net",
  },
]

export function TrendingTable() {
  const [trending, setTrending] = useState<Record<string, TrendingItem>>({});
  const data = useMemo(() => Object.values(trending), [trending])

  useEffect(() => {
    const ws = new WebSocket('wss://api.cryptoscan.pro/trending')
    ws.onmessage = (msg) => {
      console.log(msg.data)
      const trendingItem = JSON.parse(msg.data)
      console.log(trendingItem)
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
