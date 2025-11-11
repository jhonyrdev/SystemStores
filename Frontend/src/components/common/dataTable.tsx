import React from "react";
import type {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DynamicTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
}

export function DynamicTable<TData>({ columns, data }: DynamicTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSortable = header.column.getCanSort();
                return (
                  <TableHead key={header.id}>
                    {isSortable ? (
                      <Button
                        variant="ghost"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center space-x-1"
                      >
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
                      </Button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No hay datos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}