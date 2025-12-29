"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  ArrowUpDown,
  Search,
  Users,
  DatabaseZap,
  ArrowRight,
  FolderOpen
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOwner } from "@/context/owner-context";

// Helper
const formatRoomName = (key: string) => {
  if (!key) return "Untitled Room";
  const parts = key.split("-");
  if (parts.length > 2) parts.pop(); 
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
};

export default function RoomList() {
  const router = useRouter();
  const { subdomain } = useOwner();
  const rooms = subdomain?.rooms || [];
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "roomKey",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-4 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Session Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-zinc-900">
            {formatRoomName(row.original.roomKey)}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" /> {row.original.clientName || "Quick Session"}
          </span>
        </div>
      ),
    },
    {
      id: "scopeCount",
      header: "Intel Captured",
      accessorFn: (row) => {
        const data = row.scopeData as any;
        if (Array.isArray(data)) return data.length;
        return data?.items?.length || 0;
      },
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
          <DatabaseZap className="w-4 h-4 text-purple-500" />
          {getValue() as number} Items
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="text-right">
           <Button variant="ghost" className="h-8 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground text-xs font-mono">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {/* 👇 UNIFIED ACTION BUTTON */}
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-3 text-xs bg-zinc-50 hover:bg-white hover:border-zinc-300 hover:text-black"
            onClick={() => router.push(`/my/rooms/${row.original.roomKey}`)}
          >
            View Session <ArrowRight className="ml-1.5 w-3 h-3" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: rooms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight">Session History</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter sessions..." className="pl-9 h-9 bg-white" />
        </div>
      </div>

      <div className="hidden md:block rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-4">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-zinc-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No sessions found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View (Simplified) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <Card key={row.id} className="border-zinc-200 shadow-sm" onClick={() => router.push(`/my/rooms/${row.original.roomKey}`)}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{formatRoomName(row.original.roomKey)}</CardTitle>
                <div className="text-xs text-muted-foreground">{row.original.clientName}</div>
              </div>
              <FolderOpen className="text-zinc-300" />
            </CardHeader>
            <CardContent>
               <Button className="w-full" variant="outline">View Session</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}