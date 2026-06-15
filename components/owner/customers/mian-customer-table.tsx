"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Phone, Mail, Building2, Search } from "lucide-react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Updated to match your exact data structure
export type Customer = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  customerType: any; // Using 'any' or 'string' to accommodate your CustomerType enum
  status: any;       // Using 'any' or 'string' to accommodate your BookingStatus enum
  initialFollowUp?: boolean | null;
  subdomainId?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

interface MainCustomerTableProps {
  data: Customer[];
}

export function MainCustomerTable({ data }: MainCustomerTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Customer>[] = [
    {
      id: "customer",
      header: "Customer",
      // Handle null names in the global search filter
      accessorFn: (row) => row.name ?? "Unknown",
      cell: ({ row }) => {
        const customer = row.original;
        const displayName = customer.name || "Unknown Customer";
        const initial = customer.name ? customer.name.charAt(0).toUpperCase() : "U";

        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-700 shrink-0">
              {initial}
            </div>
            <div>
              <div className="font-medium text-zinc-900">{displayName}</div>
              <div className="text-xs text-zinc-500">
                Customer ID #{customer.id.slice(0, 8)} {/* Shortened ID for clean UI */}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "contact",
      header: "Contact",
      // Combine email and phone safely so the search bar can find both
      accessorFn: (row) => `${row.email ?? ""} ${row.phone ?? ""}`,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="space-y-1">
            {customer.email ? (
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                {customer.email}
              </div>
            ) : null}
            
            {customer.phone ? (
              <div className="flex items-center gap-2 text-sm text-zinc-700">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                {customer.phone}
              </div>
            ) : null}

            {!customer.email && !customer.phone && (
              <span className="text-xs text-zinc-400 italic">No contact info</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "customerType",
      header: "Type",
      cell: ({ row }) => {
        return (
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 capitalize">
            <Building2 className="w-3 h-3" />
            {String(row.getValue("customerType") || "Unknown").toLowerCase()}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium capitalize">
            {String(row.getValue("status") || "Unknown").toLowerCase()}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href={`/my/customers/${customer.id}`}>View</Link>
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search customers..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-zinc-50 hover:bg-zinc-50">
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-zinc-500"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}