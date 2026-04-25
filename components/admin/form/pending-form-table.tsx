"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowRight, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 1. Define the shape of our data based on the Prisma query
export type PendingFormData = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date | string; // Accept string for serialized server data
  client: {
    firstName: string | null;
    stripeCustomerId: string | null;
  } | null;
};

interface PendingFormsTableProps {
  data: PendingFormData[];
}

export function PendingFormTable({ data }: PendingFormsTableProps) {
  // State for sorting columns
  const [sorting, setSorting] = useState<SortingState>([]);

  // 2. Define Columns inside useMemo so they don't re-render unnecessarily
  const columns = useMemo<ColumnDef<PendingFormData>[]>(
    () => [
      {
        id: "clientInfo",
        accessorFn: (row) => row.name || row.client?.firstName || row.email,
        header: ({ column }) => (
          <span
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer select-none inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-slate-900 hover:underline underline-offset-2 transition-colors"
          >
            Client Info
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          </span>
        ),
        cell: ({ row }) => {
          const form = row.original;
          const name = form.name || form.client?.firstName || "Unknown Name";
          return (
            <div className="flex flex-col">
              <span className="font-medium text-slate-900">{name}</span>
              <span className="text-sm text-slate-500">{form.email}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <span
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer select-none inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-slate-900 hover:underline underline-offset-2 transition-colors"
          >
            Paid Date
            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
          </span>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <span className="text-sm text-slate-600">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        id: "stripeId",
        accessorFn: (row) => row.client?.stripeCustomerId,
        header: "Stripe ID",
        cell: ({ row }) => {
          const stripeId = row.original.client?.stripeCustomerId;
          return (
            <span className="text-sm font-mono text-slate-400">
              {stripeId || "No ID"}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const formId = row.original.id;
          return (
            <div className="text-right">
              <Link href={`/intake-form/pending/${formId}`}>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Start Intake <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          );
        },
      },
    ],
    [],
  );

  // 3. Initialize the table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // 4. Render the UI
  return (
    <div className="w-full">
      <div className="rounded-md border-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <ClipboardList className="w-8 h-8 text-slate-300" />
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-slate-700">
                        No pending forms
                      </p>
                      <p className="text-sm text-slate-400">
                        New submissions will appear here once clients complete
                        payment.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
         
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
