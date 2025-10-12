"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Phone, Calendar } from "lucide-react";

interface Booking {
  id?: string;
  name: string;
  phone: string;
  createdAt?: string | Date;
}

interface BookingTableProps {
  bookingData?: Booking[];
  showList?: boolean;
  setShowList?: (value: boolean) => void;
}

export function BookingTable({
  bookingData = [],
  showList,
  setShowList,
}: BookingTableProps) {
  if (!bookingData.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No booking data available</p>
      </div>
    );
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-foreground">
          Potential Clients{" "}
          <span className="text-muted-foreground">({bookingData.length})</span>
        </h1>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowList?.(!showList)}
        >
          {showList ? "Hide" : "Show"}
        </Button>
      </div>

      {showList && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg overflow-hidden border">
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
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span>{booking.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">
                          {booking.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{""}</TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDate(booking.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards - Compact Version */}
          <div className="md:hidden space-y-2">
            {bookingData.map((booking) => (
              <div
                key={booking.id || booking.phone}
                className="p-3 bg-card rounded-lg border border-border hover:bg-accent/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  {/* Left Section - Name & Phone */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium text-sm text-foreground truncate">
                        {booking.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {booking.phone}
                      </span>
                    </div>
                  </div>

                  {/* Right Section - Date */}
                  <div className="flex items-center gap-1 ml-3 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(booking.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}