"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Phone } from "lucide-react";

interface Booking {
  id?: string;
  name: string;
  phone: string;
  createdAt?: string | Date;
}

interface BookingTableProps {
  bookingData?: Booking[];
}

export function BookingTable({ bookingData = [] }: BookingTableProps) {
  if (!bookingData.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No booking data available</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <h1 className="text-lg font-semibold text-foreground">
        Potential Clients
      </h1>

      <div className=" rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookingData.map((booking) => (
              <TableRow
                key={booking.id || booking.phone}
                className="hover:bg-primary/5 transition-all"
              >
                {/* Name column */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>{booking.name}</span>
                  </div>
                </TableCell>

                {/* Phone column */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      {booking.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {""}
                </TableCell>

                {/* Created column */}
                <TableCell className="text-right text-xs text-muted-foreground">
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
