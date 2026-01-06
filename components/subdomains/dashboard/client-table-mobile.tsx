"use client";

import { useState } from "react";
import { Table } from "@tanstack/react-table";
import {
  Camera,
  ChevronRight,
  Clock,
  Database,
  Palette,
  Briefcase,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  formatCallReason,
  getEstimatedValueRange,
} from "@/lib/utils/dashboard-utils";
import { TableBooking } from "./client-table";

interface ClientTableMobileProps {
  table: Table<TableBooking>;
  formatImageUrl: (url: string | null | undefined) => string;
  openIntelligence: (booking: TableBooking) => void;
}

export function ClientTableMobile({
  table,
  formatImageUrl,
  openIntelligence,
}: ClientTableMobileProps) {
  const [selectedBooking, setSelectedBooking] = useState<TableBooking | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Mobile Row Click Handler
  const handleMobileRowClick = (booking: TableBooking) => {
    setSelectedBooking(booking);
    setIsSheetOpen(true);
  };

  return (
    <>
      {/* --- MOBILE VIEW: COMPACT LIST --- */}
      <div className="md:hidden flex flex-col gap-0 border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm mb-4">
        {table.getRowModel().rows.map((row) => {
          const data = row.original;
          const thumbnailUrl = formatImageUrl(data.thumbnailUrl);
          const date = new Date(data.lastCallAt || data.createdAt);

          return (
            <div
              key={row.id}
              onClick={() => handleMobileRowClick(data)}
              className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* 1. Mini Thumbnail */}
              <div className="w-12 h-12 rounded-md bg-gray-100 shrink-0 overflow-hidden relative">
                {data.thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt="Room"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Camera className="w-5 h-5 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* 2. Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-semibold text-sm text-gray-900 truncate pr-2">
                    {data.name}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0 bg-muted px-1 rounded-sm">
                    {date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="text-xs text-gray-500 truncate pr-2">
                    {data.projectType}
                  </div>
                  {data.estimatedValue && data.estimatedValue > 0 && (
                    <div className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      ${data.estimatedValue}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Chevron Indicator */}
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          );
        })}
      </div>

      {/* --- DETAIL SHEET (Mobile) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] sm:h-full rounded-t-[2rem] sm:rounded-none outline-none border-t border-gray-100/50 shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)] [&>button]:hidden p-0"
        >
          {selectedBooking && (
            <div className="flex flex-col h-full w-full bg-white rounded-t-[2rem]">
              {/* --- 1. GRAB HANDLE --- */}
              <div
                className="w-full flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing"
                onClick={() => setIsSheetOpen(false)}
              >
                <div className="w-10 h-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors" />
              </div>

              {/* --- HEADER --- */}
              <div className="px-6 pb-4 shrink-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <SheetTitle className="text-2xl font-bold tracking-tight text-gray-900">
                      {selectedBooking.name}
                    </SheetTitle>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-200">
                        {selectedBooking.huelineId.slice(-6)}
                      </span>
                      <span className="text-gray-300 text-[10px]">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(
                          selectedBooking.lastCallAt ||
                            selectedBooking.createdAt
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Call Button */}
                  <a
                    href={`tel:${selectedBooking.phone}`}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm active:scale-95 transition-transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* --- SCROLLABLE CONTENT --- */}
              <div className="overflow-y-auto px-6 pb-32 space-y-4 flex-1">
                {/* 1. Hero Visual (with Overlay) */}
                <div className="aspect-[16/10] w-full relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  {selectedBooking.thumbnailUrl ? (
                    <Image
                      src={formatImageUrl(selectedBooking.thumbnailUrl)}
                      alt="Project"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                      <Camera className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium">No Preview</span>
                    </div>
                  )}

                  {/* OVERLAY: Design DNA (Palette) */}
                  {selectedBooking.paintColors &&
                    selectedBooking.paintColors.length > 0 && (
                      <div className="absolute bottom-3 left-3 p-2.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm max-w-[85%] animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-white mb-1.5 flex items-center gap-1.5">
                          <Palette className="w-3 h-3" /> Design
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedBooking.paintColors
                            .slice(0, 5)
                            .map((color, idx) => (
                              <div
                                key={idx}
                                className="w-5 h-5 rounded-full border border-gray-200 shadow-sm ring-1 ring-white"
                                style={{ backgroundColor: color.hex }}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* 2. Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* A. Target Intent */}
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Target Intent
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <div className="text-sm font-semibold text-gray-900 leading-none">
                        {formatCallReason(
                          selectedBooking.initialIntent || "General"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* B. Est. Opportunity */}
                  <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
                      <Database className="w-3 h-3" /> Est. Opportunity
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          (selectedBooking.estimatedValue ?? 0) > 0
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <div
                        className={`text-sm font-bold leading-none ${
                          (selectedBooking.estimatedValue ?? 0) > 0
                            ? "text-green-600"
                            : "text-gray-900"
                        }`}
                      >
                        {(selectedBooking.estimatedValue ?? 0) > 0
                          ? `+${getEstimatedValueRange(
                              selectedBooking.estimatedValue!
                            )}`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Project Scope */}
                <div className="p-3.5 rounded-xl border border-gray-100 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Project Scope
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.projectScope &&
                    selectedBooking.projectScope.length > 0 ? (
                      selectedBooking.projectScope.map((scope, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700"
                        >
                          {scope}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-300 italic">
                        No scope details
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Context / Last Interaction */}
                {selectedBooking.lastInteraction && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Last Interaction
                    </h4>
                    <div className="text-xs text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      {selectedBooking.lastInteraction}
                    </div>
                  </div>
                )}
              </div>

              {/* --- FOOTER --- */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-white/0 pt-10 rounded-b-none">
                <div className="grid grid-cols-[1fr_2fr] gap-3">
                  <Button
                    onClick={() => {
                      setIsSheetOpen(false);
                      openIntelligence(selectedBooking);
                    }}
                    variant="outline"
                    className="h-12 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"
                  >
                    <Database className="w-4 h-4 mr-2 text-purple-500" />
                    Intel
                  </Button>

                  <Link
                    href={`/j/${selectedBooking.huelineId}`}
                    // target="_blank"
                    className="w-full"
                  >
                    <Button className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-200 font-medium">
                      <Palette className="w-4 h-4 mr-2" />
                      Open Studio
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}