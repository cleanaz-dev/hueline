"use client";

import React, { useState } from "react";
import { Calendar, Image as ImageIcon, PhoneCall } from "lucide-react";
import BookingTab from "./booking-tab";
import CallTab from "./call-tab";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
export type Mockup = {
  hex?: string;
  brand?: string;
  code?: string;
  name?: string;
  compressedS3Key?: string;
};

export type PaintColor = {
  hex: string;
  brand: string;
  name: string;
};

export type CallIntelligence = {
  callReason: string;
  projectScope: string;
  callOutcome: string;
  estimatedAdditionalValue: number;
  customFields: Record<string, any>;
  costBreakdown: string;
  transcriptText: string;
  callSummary: string;
};

export type Call = {
  id: string;
  audioUrl?: string;
  duration: string;
  status: string;
  createdAt: string;
  bookingDataId: string;
  intelligence?: CallIntelligence;
};

export type Booking = {
  id: string;
  huelineId?: string;
  compressOriginalImages?: string;
  createdAt: string;
  prompt?: string;
  mockups?: Mockup[];
  paintColors?: PaintColor[];
  designProjects?: { id: string }[];
};

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
  }).format(new Date(dateString));

// ----------------------------------------------------------------------
// BookingCard
// ----------------------------------------------------------------------
export default function BookingCard({
  booking,
  calls = [],
}: {
  booking: Booking;
  calls?: Call[];
}) {
  const [activeTab, setActiveTab] = useState<"visuals" | "call">("visuals");

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col gap-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        {/* Tab Switcher */}
        <div className="flex bg-gray-50/80 p-1 rounded-xl w-fit border border-gray-100">
          <button
            onClick={() => setActiveTab("visuals")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "visuals"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Visualizer Request
          </button>

          {calls.length > 0 && (
            <button
              onClick={() => setActiveTab("call")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "call"
                  ? "bg-white shadow-sm text-[#007AFF]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Insights
              {calls.length > 1 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === "call" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}
                >
                  {calls.length}
                </span>
              )}
              {calls.length === 1 && (
                <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
              )}
            </button>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full">
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
      </div>

      {/* Tab Content */}
      <div className="h-[360px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {activeTab === "visuals" && <BookingTab booking={booking} />}
        {activeTab === "call" && calls.length > 0 && <CallTab calls={calls} />}
      </div>
    </div>
  );
}