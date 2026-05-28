"use client"

import React from "react"
import Link from "next/link"
import {
  Calendar,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react"

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export type Mockup = {
  hex?: string
}

export type PaintColor = {
  hex: string
  brand: string
  name: string
}

export type Booking = {
  id: string
  huelineId?: string
  createdAt: string
  prompt?: string
  mockups?: Mockup[]
  paintColors?: PaintColor[]
  designProjects?: { id: string }[]
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString))

// ----------------------------------------------------------------------
// BookingCard
// ----------------------------------------------------------------------
export default function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col gap-6">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-bold text-white tracking-wide">
            ID: {booking.huelineId || booking.id.slice(0, 8)}
          </span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(booking.createdAt)}
        </span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">

        {/* Image placeholder */}
        <div className="relative flex-1 bg-[#F8FAFC] rounded-2xl border border-gray-100 overflow-hidden min-h-[280px] flex flex-col items-center justify-center">
          <ImageIcon className="w-10 h-10 text-gray-300 mb-3" />
          <span className="text-xs font-semibold text-gray-400">Original Image</span>

          {booking.mockups && booking.mockups.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm shadow-md rounded-full px-4 py-2 flex items-center gap-3 border border-gray-100">
              <div className="flex -space-x-1.5">
                {booking.mockups.slice(0, 3).map((m, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: m.hex || "#ccc" }}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">
                {booking.mockups.length} Mockups
              </span>
            </div>
          )}
        </div>

        {/* Details sidebar */}
        <div className="w-full xl:w-72 flex flex-col gap-6">

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
            {booking.paintColors && booking.paintColors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {booking.paintColors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-xl shadow-sm border border-gray-100/50 cursor-default"
                    style={{ backgroundColor: color.hex }}
                    title={`${color.brand.replace("_", " ")}: ${color.name}`}
                  />
                ))}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                <span className="text-gray-400 text-xs font-bold">+</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <Link
            href={`/my/design-studio/${booking.designProjects?.[0]?.id || ""}`}
            className="mt-auto w-full flex items-center justify-center gap-2 bg-[#007AFF] hover:bg-[#0062CC] text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Open in Studio
          </Link>
        </div>
      </div>
    </div>
  )
}