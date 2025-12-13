"use client";

import { CloudDownload } from "lucide-react";
import { BsBadge8K, BsBadge4K } from "react-icons/bs";
import { useBooking } from "@/context/booking-context";
import { Export } from "@/types/subdomain-type";
import Link from "next/link";

export default function ExportOptions() {
  const { setIsExportDialogOpen, booking } = useBooking();

  const exports: Export[] = booking?.exports || [];

  const hasProcessingOrCompleted = exports.some(
    (e) => e.status === "processing" || e.status === "complete"
  );

  console.log("object");

  return (
    <div className="space-y-4">
      {/* ⭐ KEEPING YOUR LABEL EXACTLY AS IS */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest">
          Export Options
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 pt-2">
        {hasProcessingOrCompleted ? (
          /* ⭐ SHOW THIS BUTTON WHEN PROCESSING OR COMPLETED EXISTS */
          <Link 
            href={`/booking/${booking.huelineId}/downloads`}
            className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden transition-all bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200  flex flex-col items-center justify-center group cursor-pointer hover:ring-2 ring-primary"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <CloudDownload className="w-7 h-7 text-muted-foreground transition-colors mb-2" />
              <span className="text-xs font-semibold text-muted-foreground text-balance text-center">
                Downloads Available
              </span>
            </div>
          </Link>
        ) : (
          /* ⭐ DEFAULT EXPORT BUTTON */
          <button
            onClick={() => setIsExportDialogOpen(true)}
            className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden transition-all border bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-primary flex flex-col items-center justify-center group cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <CloudDownload className="w-7 h-7 text-gray-600 group-hover:text-primary transition-colors mb-2" />
              <div className="flex gap-2">
                <BsBadge4K className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
                <BsBadge8K className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}