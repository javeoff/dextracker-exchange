"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useRef, useState } from "react";
import { SubscribeData } from "./ui/trades-chart";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import Image from "next/image";
import { getAgo, getBigNumber, getPrice, getTagImage, getTagTooltip, getVolumeImage, getVolumeTooltip } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { CircularProgress } from "./ui/circular-progress";
import Link from "next/link";
import { DataTransparentTable } from "./data-transparent-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { Input } from "./ui/input";
import { FilterIcon } from "lucide-react";
import { Button } from "./ui/button";

const columns: ColumnDef<SubscribeData>[] = [
  {
    accessorKey: "createdAt",
    header: "Age",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as number;

      return (
        <div className="flex items-center gap-1">
          {getAgo(new Date(createdAt))}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;

      return (
        <div className={`flex items-center gap-1 ${type === 'buy' ? 'text-green-600 dark:text-green-200' : 'text-red-600 dark:text-red-200'}`}>
          {type}
        </div>
      )
    },
  },
  {
    accessorKey: "volume",
    header: ({ column }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="hover:bg-muted/30 flex gap-1 items-center rounded-md w-max px-2 relative right-2 cursor-pointer">
            Volume
            <FilterIcon className="size-3 text-muted-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background p-2 border rounded-md z-10">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1 w-[200px]">
              <Input
                placeholder="Min $"
                className="h-8 placeholder:text-xs text-xs px-2"
                defaultValue={(column.getFilterValue() as number[])?.[0]}
                onChange={(e) => column.setFilterValue((prev: number[]) => [e.target.value, prev?.[1]])}
              />
              <Input
                placeholder="Max $"
                className="h-8 placeholder:text-xs text-xs px-2"
                defaultValue={(column.getFilterValue() as number[])?.[1]}
                onChange={(e) => column.setFilterValue((prev: number[]) => [prev?.[0], e.target.value])}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                className="block w-full mt-1 h-8 text-xs"
                onClick={() => column.setFilterValue([])}
              >
                Reset
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    cell: ({ row }) => {
      const volume = row.getValue("volume") as number;
      const pnl = row.original.pnl as number;

      return (
        <div className="flex items-center gap-1">
          ${getBigNumber(volume > 1 ? Math.ceil(volume) : volume)}
          {!!row.original.bought && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <CircularProgress
                    percentage={row.original.sold / row.original.bought * 100}
                    size={15}
                    bgColor="transparent"
                    color="rgb(221,89,116)"
                    strokeWidth={3}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bought/Sold: ${getBigNumber(row.original.bought)}/${getBigNumber(row.original.sold)}</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Image src={getVolumeImage(volume)} width={12} height={12} alt="volume" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getVolumeTooltip(volume)}</p>
            </TooltipContent>
          </Tooltip>
          {!!Math.ceil(pnl) && (
            <div className={`bg-input/30 py-1 px-1 rounded-md text-xs/2 ${pnl > 0 ? 'text-green-600 dark:text-green-200' : 'text-red-600 dark:text-red-200'}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    {pnl > 0 ? '+' : '-'}${Math.abs(pnl).toFixed()}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>PnL</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      const type = row.getValue("type") as string;

      return (
        <div className={`flex items-center gap-1 ${type === 'buy' ? 'text-green-600 dark:text-green-200' : 'text-red-600 dark:text-red-200'}`}>
          ${getPrice(Number(price))}
        </div>
      )
    },
  },
  {
    accessorKey: "exchange",
    header: "Exchange",
    cell: ({ row }) => {
      const exchange = row.getValue("exchange") as string;

      return (
        <div className="flex items-center gap-1">
          <Avatar className="rounded-lg w-[15px] h-[15px]">
            <AvatarImage src={exchange + '.png'} alt={exchange} width={15} height={15} />
            <AvatarFallback className="rounded-lg"></AvatarFallback>
          </Avatar>
          {exchange}
        </div>
      )
    },
  },
  {
    accessorKey: "walletAddress",
    header: "Maker",
    cell: ({ row }) => {
      const walletAddress = row.getValue("walletAddress") as string;
      const tags = row.original.tags as string[];
      const boughtAt = row.original.boughtAt ? new Date(row.original.boughtAt) : undefined;;

      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          {!!walletAddress && (
            <div>{walletAddress.slice(0, 5)}{walletAddress.length > 8 ? '...' : ''}{walletAddress.slice(-3)}</div>
          )}
          {tags?.map((tag) => tag === 'new' ? '✨' : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image key={tag} src={getTagImage(tag)} width={12} height={12} alt={tag} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getTagTooltip(tag)}</p>
                </TooltipContent>
              </Tooltip>
            </>
          ))}
          {!!boughtAt && (
            <div className={`bg-input/30 py-1 px-1 rounded-md text-xs/2`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    {getAgo(boughtAt, true)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Holding duration</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      if (!row.original.txn) {
        return null;
      }
      return (
        <Link href={"https://solscan.io/tx/" + row.original.txn} target="_blank">
          <Image src="/solscan.svg" alt="solscan" width={12} height={12} />
        </Link>
      )
    }
  }
]

interface Props {
  subscribe: (cb: (data: SubscribeData) => void) => void;
}

export function TradesTable({ subscribe }: Props) {
  const isPausedRef = useRef(false);
  const [data, setData] = useState<SubscribeData[]>([]);
  const bufferRef = useRef<SubscribeData[]>([]); // буфер для данных во время паузы

  const onPaused = (isPaused: boolean) => {
    isPausedRef.current = isPaused;

    if (!isPaused && bufferRef.current.length > 0) {
      setData((prev) => [...bufferRef.current, ...prev]);
      bufferRef.current = [];
    }
  };

  useEffect(() => {
    subscribe((d) => {
      if (!d.price) return;

      setData((prev) => {
        const index = prev.findIndex(item => item.txn === d.txn);
        if (index !== -1 && 'tags' in d) {
          const newData = [...prev];
          newData[index] = d;
          return newData;
        }

        if (isPausedRef.current) {
          bufferRef.current.unshift(d);
          return prev;
        }

        return [d, ...prev];
      });
    });
  }, [subscribe]);

  return (
    <DataTransparentTable
      columns={columns}
      data={data}
      onPaused={onPaused}
    />
  );
}
