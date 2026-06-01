"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  MessageSquare,
  Paintbrush,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { Booking } from "./booking-card";
import { Mockup, Quote } from "@/app/generated/prisma";
import { useTransition } from "react";
import { createOrOpenQuote } from "./actions"; // Import your action
import { Loader2 } from "lucide-react";
import { GenerateQuoteButton } from "./generate-quote-button";

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
function formatBrandName(brandRaw?: string) {
  if (!brandRaw) return "Unknown Brand";
  const brandMap: Record<string, string> = {
    sherwin_williams: "Sherwin-Williams",
    benjamin_moore: "Benjamin Moore",
    behr: "Behr",
    ral: "RAL",
  };
  return (
    brandMap[brandRaw.toLowerCase()] ||
    brandRaw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// ----------------------------------------------------------------------
// BookingTab
// ----------------------------------------------------------------------
export default function BookingTab({ booking }: { booking: Booking }) {
  const [selectedMockup, setSelectedMockup] = useState<Mockup | null>(null);
  const [isShelfOpen, setIsShelfOpen] = useState(false);

  // @ts-ignore
  const displayImageUrl = selectedMockup
    ? selectedMockup.compressedS3Key || selectedMockup.presignedUrl
    : booking.compressOriginalImages;

  const [isPending, startTransition] = useTransition();

  const handleGenerateQuote = () => {
    startTransition(() => {
      // Pass the customerId (from props/context) and the booking ID
      createOrOpenQuote(booking?.customerId, booking.huelineId);
    });
  };

  return (
    // min-h-0 is crucial here to prevent the flex container from stretching past its parent
    <div className="flex flex-col xl:flex-row gap-5 animate-in fade-in zoom-in-95 duration-300 h-full min-h-0">
      {/* LEFT: Image Viewer */}
      <div className="relative flex-1 bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden min-h-[280px] h-full flex flex-col items-center justify-center group/viewer shadow-inner">
        {/* Crossfade Images */}
        {booking.compressOriginalImages ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={booking.compressOriginalImages}
            alt="Original"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
              selectedMockup === null ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <ImageIcon className="w-10 h-10 text-zinc-300 mb-3" />
            <span className="text-xs font-semibold text-zinc-400">
              No Image Available
            </span>
          </div>
        )}

        {booking.mockups?.map((m) => {
          const isSelected = selectedMockup?.id === m.id;
          // @ts-ignore
          const imgUrl = m.compressedS3Key || m.presignedUrl;
          if (!imgUrl) return null;

          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={m.id}
              src={imgUrl}
              alt="Generated Mockup"
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
                isSelected
                  ? "opacity-100 z-10"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            />
          );
        })}

        {/* INTERACTIVE SHELF OVERLAY */}
        {booking.mockups && booking.mockups.length > 0 && (
          <div className="absolute bottom-5 inset-x-0 z-30 flex flex-col items-center justify-end pointer-events-none">
            <div
              className={`flex items-end gap-3 border-b-[3px] border-white/90 px-6 pb-4 pt-6 max-w-[95%] overflow-x-auto scrollbar-hide origin-bottom transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isShelfOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-12 scale-95 pointer-events-none"}
              `}
            >
              <button
                onClick={() => setSelectedMockup(null)}
                className={`group relative h-20 w-32 shrink-0 overflow-hidden rounded-xl transition-all duration-300 ease-out
                  ${selectedMockup === null ? "border-[3px] border-white scale-105 shadow-xl z-20" : "border-2 border-white/50 scale-100 shadow-md z-0 hover:z-10 hover:border-white hover:scale-[1.02]"}
                `}
              >
                {booking.compressOriginalImages && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={booking.compressOriginalImages}
                    alt="Original"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1.5">
                  <div className="flex h-3 w-3 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/50">
                    <div className="h-1 w-1 rounded-full bg-white" />
                  </div>
                  <span className="text-[8px] font-bold tracking-widest text-white drop-shadow-md">
                    ORIGINAL
                  </span>
                </div>
              </button>

              <div className="h-12 w-px bg-white/40 mx-1 shrink-0 rounded-full" />

              {booking.mockups.map((mockup) => {
                const isSelected = selectedMockup?.id === mockup.id;
                // @ts-ignore
                const hex = mockup.hex || mockup.colorHex || "#cccccc";
                // @ts-ignore
                const thumbnailUrl =
                  mockup.compressedS3Key || mockup.presignedUrl;

                return (
                  <button
                    key={mockup.id}
                    onClick={() => setSelectedMockup(mockup as Mockup)}
                    className={`group relative h-20 w-32 shrink-0 overflow-hidden rounded-xl transition-all duration-300 ease-out
                      ${isSelected ? "border-[3px] border-white scale-105 shadow-xl z-20" : "border-2 border-white/50 scale-100 shadow-md z-0 hover:z-10 hover:border-white hover:scale-[1.02]"}
                    `}
                  >
                    {thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailUrl}
                        alt="Mockup Thumbnail"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1.5">
                      <div
                        className="h-3 w-3 rounded-full border border-white shadow-md"
                        style={{ backgroundColor: hex }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* MINIMAL TRIGGER PILL */}
            <button
              onClick={() => setIsShelfOpen(!isShelfOpen)}
              className="mt-2 pointer-events-auto group flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-lg backdrop-blur-md ring-1 ring-black/5 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
            >
              <div className="flex -space-x-1">
                {booking.mockups.slice(0, 3).map((m, i) => {
                  // @ts-ignore
                  const hex = m.hex || m.colorHex || "#ccc";
                  return (
                    <div
                      key={m.id || i}
                      className="h-3.5 w-3.5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: hex, zIndex: 10 - i }}
                    />
                  );
                })}
              </div>
              <span>
                {isShelfOpen ? "Hide" : `${booking.mockups.length} Mockups`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Details Sidebar */}
      {/* 
        This is now a strict flex column.
        The top part scrolls if it needs to, the bottom part STAYS anchored. No overlaps!
      */}
      <div className="w-full xl:w-[280px] shrink-0 flex flex-col h-full min-h-0 bg-white border border-zinc-100 shadow-sm rounded-2xl">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 flex flex-col gap-5">
          {/* Prompt / Request */}
          <div>
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="h-3 w-3" />
              Customer Request
            </h4>
            <div className="text-xs text-zinc-700 leading-snug bg-zinc-50 p-3 rounded-xl border border-zinc-100 italic">
              "{booking.prompt || "No prompt provided."}"
            </div>
          </div>

          {/* Selected Palette Stack */}
          <div className="flex-1 flex flex-col pb-2">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1.5">
              <Paintbrush className="h-3 w-3" />
              Selected Palette
            </h4>

            {booking.mockups && booking.mockups.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {/* "Original Image" reset button */}
                <button
                  onClick={() => setSelectedMockup(null)}
                  className={`flex items-center text-left gap-2.5 rounded-xl border p-2 transition-all duration-200
                    ${
                      selectedMockup === null
                        ? "border-zinc-900 bg-white ring-1 ring-zinc-900 shadow-sm"
                        : "border-transparent bg-transparent hover:bg-zinc-50"
                    }
                  `}
                >
                  <div className="h-7 w-7 shrink-0 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                    <ImageIcon className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-xs font-bold text-zinc-900">
                      Original Photo
                    </span>
                    <span className="truncate text-[9px] font-medium uppercase text-zinc-500">
                      Unedited
                    </span>
                  </div>
                </button>

                {booking.mockups.map((m, idx) => {
                  const isSelected = selectedMockup?.id === m.id;

                  // @ts-ignore
                  const brandRaw = m.brand || m.colorBrand || "";
                  const cleanBrandName = formatBrandName(brandRaw);
                  // @ts-ignore
                  const colorName = m.name || m.colorName || "Unknown Color";
                  // @ts-ignore
                  const colorCode = m.code || m.colorCode || "N/A";
                  // @ts-ignore
                  const hex = m.hex || m.colorHex || "#cccccc";

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedMockup(m as Mockup)}
                      className={`flex items-center text-left gap-2.5 rounded-xl border p-2 transition-all duration-200
                        ${
                          isSelected
                            ? "border-zinc-900 bg-white ring-1 ring-zinc-900 shadow-sm"
                            : "border-zinc-100 bg-zinc-50 hover:border-zinc-300 hover:bg-zinc-100/80"
                        }
                      `}
                    >
                      <div
                        className="h-7 w-7 shrink-0 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: hex }}
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-xs font-bold text-zinc-900">
                          {colorName}
                        </span>
                        <span className="truncate text-[9px] font-medium uppercase text-zinc-500">
                          {cleanBrandName} • {colorCode}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-center mt-2">
                <span className="text-[10px] font-semibold text-zinc-500">
                  No mockups generated
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --- FIXED QUOTE ACTION AT BOTTOM --- */}
        {/* shrink-0 ensures this area never gets compressed, and naturally sits beneath the scrollable area */}
        <div className="shrink-0 p-4 pt-3 border-t border-zinc-100 bg-zinc-50/50 rounded-b-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Calculator className="h-3 w-3" />
              Next Step
            </span>
          </div>
          <GenerateQuoteButton
            customerId={booking.customerId}
            huelineId={booking.huelineId}
            hasExistingQuote={!!booking.quotes && booking.quotes.length > 0}
            quoteId={
              booking.quotes && booking.quotes.length > 0
                ? booking.quotes[0].id
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
