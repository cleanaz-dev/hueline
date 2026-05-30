"use client";

import React from "react";
import { Image as ImageIcon } from "lucide-react";
import { Booking } from "./booking-card";

// ----------------------------------------------------------------------
// BookingTab
// ----------------------------------------------------------------------
export default function BookingTab({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in zoom-in-95 duration-300 h-full">
      {/* Image placeholder (Stretches to fill available space) */}
      <div className="relative flex-1 bg-[#F8FAFC] rounded-2xl border border-gray-100 overflow-hidden min-h-[280px] h-full flex flex-col items-center justify-center">
        {booking.compressOriginalImages ? (
          <img
            src={booking.compressOriginalImages}
            alt="Original"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <ImageIcon className="w-10 h-10 text-gray-300 mb-3" />
            <span className="text-xs font-semibold text-gray-400">
              Original Image
            </span>
          </>
        )}
        {/* Overlapping mockup thumbnails */}
        {booking.mockups && booking.mockups.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm shadow-md rounded-full px-4 py-2 flex items-center gap-3 border border-gray-100">
            <div className="flex -space-x-1.5">
              {booking.mockups.slice(0, 3).map((m, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm overflow-hidden"
                  style={{ backgroundColor: m.hex || "#ccc" }}
                >
                  {m.compressedS3Key && (
                    <img
                      src={m.compressedS3Key}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-700">
              {booking.mockups.length} Mockups
            </span>
          </div>
        )}
      </div>

      {/* Details sidebar */}
      <div className="w-full xl:w-72 flex flex-col gap-6 h-full">
        {/* Prompt */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Customer Request
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
            "{booking.prompt || "No prompt provided."}"
          </p>
        </div>

        {/* Palette */}
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Selected Palette
          </h4>
          {booking.mockups && booking.mockups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {booking.mockups.map((m, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1"
                  title={`${m.brand || ""} ${m.code || ""} ${m.name || ""}`}
                >
                  <div
                    className="w-12 h-12 rounded-xl shadow-sm border border-gray-100/50"
                    style={{ backgroundColor: m.hex || "#ccc" }}
                  />
                  {m.name && (
                    <span className="text-[9px] font-semibold text-gray-500 text-center leading-tight max-w-[48px] truncate">
                      {m.name}
                    </span>
                  )}
                  {m.code && (
                    <span className="text-[8px] text-gray-400 text-center max-w-[48px] truncate">
                      {m.code}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
              <span className="text-gray-400 text-xs font-bold">+</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}