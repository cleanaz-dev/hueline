"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge" // Assuming shadcn, or use standard div
import { formatDistanceToNow } from "date-fns"

export type Prospect = {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  status: string
  createdAt: Date
  communication: { createdAt: Date; body: string; role: string }[]
  subBookingData: { huelineId: string } | null // Adjust based on your actual schema
}

export const columns: ColumnDef<Prospect>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name") || "Unknown"}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === "BOOKED" ? "bg-green-500" : "bg-blue-500"
      return <Badge className={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    id: "lastActivity",
    header: "Last Activity",
    cell: ({ row }) => {
      const lastComm = row.original.communication[0]
      if (!lastComm) return <span className="text-muted-foreground text-xs">No activity</span>
      return (
        <div className="flex flex-col">
          <span className="text-xs truncate max-w-50 italic">"{lastComm.body}"</span>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(lastComm.createdAt), { addSuffix: true })}
          </span>
        </div>
      )
    },
  },
  {
    id: "booking",
    header: "Cal.com ID",
    cell: ({ row }) => {
      return <code className="text-xs">{row.original.subBookingData?.huelineId || "N/A"}</code>
    },
  },
]