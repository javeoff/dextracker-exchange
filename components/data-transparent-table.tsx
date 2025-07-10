"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React, { useState } from "react"
import { PauseIcon } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onPaused?: (paused: boolean) => void;
}

export function DataTransparentTable<TData, TValue>({
  columns,
  data,
  onPaused,
}: DataTableProps<TData, TValue>) {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const pauseHandle = (flag: boolean) => {
    setIsPaused(flag);
    if (onPaused) {
      onPaused(flag);
    }
  }

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnFilters,
    },
  })

  return (
    <div className="relative rounded-md">
      {isPaused && (
        <div className="flex items-center gap-1 bg-input/30 absolute top-[7px] right-0 bg-background border rounded-md px-3 py-[2px] text-xs">
          <PauseIcon width={12} height={12} />
          Paused
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
          {table.getRowModel()?.rows?.length ? (
            table.getRowModel().rows.slice(0, 50).map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onMouseEnter={() => pauseHandle(true)}
                onMouseLeave={() => pauseHandle(false)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
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
    </div>
  )
}
