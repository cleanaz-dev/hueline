"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSuperAdmin } from "@/context/super-admin-context"
import { Skeleton } from "@/components/ui/skeleton" // Make sure you have this shadcn component!
import { Inbox } from "lucide-react"

export function DataTable({ columns }: any) {
  const { openChat, isProspectsLoading, globalProspects } = useSuperAdmin();

  // Handle the data gracefully
  const data = globalProspects ||[];
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* --- HEADER & STATS (Untouched) --- */}
      <div>
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight">Lead Command Center</h1>
          <p className="text-muted-foreground mt-2">
            Monitor AI conversations and intervene in real-time.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-5 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-muted-foreground mb-1">Active Leads</p>
            <p className="text-3xl font-bold tracking-tight">{isProspectsLoading ? <Skeleton className="h-9 w-16 mt-1" /> : data.length}</p>
          </div>
          <div className="p-5 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-muted-foreground mb-1">Booked Today</p>
            <p className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500">
              {isProspectsLoading ? (
                <Skeleton className="h-9 w-16 mt-1" />
              ) : (
                data.filter((p: any) => p.status === 'BOOKED').length
              )}
            </p>
          </div>
        </div>
      </div>

      {/* --- PREMIUM TABLE WIDGET --- */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="h-11 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {isProspectsLoading ? (
              // PREMIUM LOADING STATE
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {columns.map((_: any, cellIndex: number) => (
                    <TableCell key={cellIndex} className="py-4">
                      <Skeleton className="h-5 w-full max-w-[80%]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // PREMIUM EMPTY STATE
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Inbox size={24} className="opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No leads found in the command center.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // PREMIUM DATA ROWS
              table.getRowModel().rows?.map((row) => (
                <TableRow 
                  key={row.id} 
                  // The "group" class lets us target child elements on hover
                  // The inset box-shadow creates a sleek primary-colored line on the left edge on hover
                  className="cursor-pointer group hover:bg-muted/30 hover:shadow-[inset_4px_0_0_0_hsl(var(--primary))] transition-all duration-200 border-b-border/50"
                  onClick={() => openChat(row.original as any)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 align-middle transition-colors">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}