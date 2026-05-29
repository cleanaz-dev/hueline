"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Image as ImageIcon,
  Sparkles,
  PhoneCall,
  DollarSign,
  Info,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
} from "lucide-react";

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

const formatLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();
};

// Keys we want to display in the UI right now (filtering out the long list)
const PRIORITIZED_REQUIREMENTS = ["propertyType", "square_footage"];

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
  const [activeCallId, setActiveCallId] = useState<string | null>(
    calls[0]?.id || null,
  );

  const activeCall = calls.find((c) => c.id === activeCallId) || calls[0];

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

      {/* FIXED HEIGHT CONTENT CONTAINER */}
      {/* 400px height ensures it doesn't push the page down while remaining sleek */}
      <div className="h-[360px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        {/* ------------------------------------------------------------------
            TAB 1: VISUALIZER
        ------------------------------------------------------------------ */}
        {activeTab === "visuals" && (
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

              {/* CTA pushed to bottom */}
              <Link
                href={`/my/design-studio/${booking.designProjects?.[0]?.id || ""}`}
                className="mt-auto w-full flex items-center justify-center gap-2 bg-[#007AFF] hover:bg-[#0062CC] text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Open in Studio
              </Link>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            TAB 2: CALL INTELLIGENCE
        ------------------------------------------------------------------ */}
        {activeTab === "call" && activeCall?.intelligence && (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Multi-Call Selector (Only shows if > 1 call exists) */}
            {calls.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                {calls.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCallId(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border transition-all ${
                      activeCallId === c.id
                        ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                        : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    Call {idx + 1} • {formatDate(c.createdAt)}
                  </button>
                ))}
              </div>
            )}

            {/* Top Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Outcome
                </p>
                <p
                  className={`text-sm font-bold ${activeCall.intelligence.callOutcome === "POSITIVE" ? "text-emerald-600" : "text-gray-900"}`}
                >
                  {activeCall.intelligence.callOutcome}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Est. Value
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  ${activeCall.intelligence.estimatedAdditionalValue}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Reason
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {activeCall.intelligence.callReason.replace(/_/g, " ")}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Scope
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {activeCall.intelligence.projectScope}
                </p>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
              {/* Left Col: AI Summary & Cost */}
              <div className="flex-1 space-y-6">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 bg-blue-100 w-16 h-16 rounded-full blur-xl opacity-50" />
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#007AFF]" /> AI Call
                    Summary
                  </h4>
                  <p className="text-sm text-blue-900/80 leading-relaxed font-medium">
                    {activeCall.intelligence.callSummary}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Cost Breakdown
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {activeCall.intelligence.costBreakdown}
                  </p>
                </div>
              </div>

              {/* Right Col: Extracted Fields & Audio */}
              <div className="w-full xl:w-80 space-y-6 flex flex-col">
                {/* Audio Playback */}
                {activeCall.audioUrl && (
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Recording
                    </h4>
                    <audio
                      controls
                      src={`${activeCall.audioUrl}`}
                      className="w-full h-10 rounded-lg outline-none"
                    />
                  </div>
                )}

                {/* Requirements Grid */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Key Requirements
                  </h4>
                  <div className="grid grid-cols-2 gap-2 pb-4">
                    {Object.entries(activeCall.intelligence.customFields)
                      .filter(([key]) => PRIORITIZED_REQUIREMENTS.includes(key))
                      .map(([key, val]) => (
                        <div
                          key={key}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1 shadow-sm"
                        >
                          <span className="text-[9px] text-gray-400 uppercase tracking-wider truncate">
                            {formatLabel(key)}
                          </span>
                          <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                            {typeof val === "boolean" ? (
                              val ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                                  Yes
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-gray-300" />{" "}
                                  No
                                </>
                              )
                            ) : (
                              val || "N/A"
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
