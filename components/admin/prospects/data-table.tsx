"use client"

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSuperAdmin } from "@/context/super-admin-context"

export function DataTable({ columns }: any) {
  const { openChat, isProspectsLoading, globalProspects } = useSuperAdmin();

  if (isProspectsLoading) {
    return <div>Loading...</div>
  }

  const data = globalProspects
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
<>
     <header>
        <h1 className="text-4xl font-extrabold tracking-tight">Lead Command Center</h1>
        <p className="text-muted-foreground mt-2">
          Monitor AI conversations and intervene in real-time.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
          <p className="text-2xl font-bold">{data.length}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Booked Today</p>
          <p className="text-2xl font-bold text-green-600">
            {data.filter(p => p.status === 'BOOKED').length}
          </p>
        </div>
      </div>
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.map((row) => (
            <TableRow 
              key={row.id} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              // THE FIX IS HERE 👇
              onClick={() => openChat(row.original as any)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  )
}