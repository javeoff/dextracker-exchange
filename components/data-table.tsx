"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React from "react"
import { Skeleton } from "./ui/skeleton"
import { cn } from "@/lib/utils"
import { track } from "@vercel/analytics"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  storageKey?: string
}

const numberRangeFilter: FilterFn<{ min: number; max: number }> = (row, columnId, value) => {
  const val = row.getValue(columnId) as number;
  const min = value?.min ?? -Infinity;
  const max = value?.max ?? Infinity;
  return val >= min && val <= max;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  storageKey,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();

  const loadFromStorage = <T,>(key: string, fallback: T): T => {
    if (typeof window === "undefined" || !storageKey) return fallback;
    try {
      const raw = localStorage.getItem(`${storageKey}:${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const [sorting, setSorting] = React.useState<SortingState>(
    () => loadFromStorage("sorting", [])
  )
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    () => loadFromStorage("filters", [])
  )

  React.useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;
    localStorage.setItem(`${storageKey}:sorting`, JSON.stringify(sorting));
  }, [sorting, storageKey]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;
    localStorage.setItem(`${storageKey}:filters`, JSON.stringify(columnFilters));
  }, [columnFilters, storageKey]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    filterFns: {
      "number-range": numberRangeFilter,
    },
  })

  return (
    <div className="rounded-md">
      <Table
        containerClassName="overflow-y-scroll px-5 mt-15 sm:mt-0 max-h-[calc(100vh-24px)] sm:max-h-[calc(100vh-56px)]"
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => {
                const isFirst = idx === 0;
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "z-20 select-none lg:sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                      isFirst && "left-0 z-30 bg-background", // sticky left
                      isFirst && "w-40 min-w-[10rem] max-w-[10rem]" // fixed width (optional)
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            [...Array(10)].map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="animate-pulse">
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className={cn("h-7 my-1 w-full", j === 0 && "w-40")} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="group hover:cursor-pointer"
                data-state={row.getIsSelected() && "selected"}
                onClick={() => {
                  track('token open', {}, { flags: ['trending'] });
                  router.push(`/${(row.original as { address: string }).address}?ref=${new URLSearchParams(window.location.search).get('ref')}`)
                }}
              >
                {row.getVisibleCells().map((cell, colIndex) => {
                  const isFirst = colIndex === 0;
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        isFirst && "lg:sticky left-0 z-10 bg-background dark:group-hover:bg-[#181818] group-hover:bg-[#f9f9f9] transition-colors",
                        isFirst && "min-w-[10rem]" // match header width
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div >
  )
}
