"use client";

import React, { useState } from "react";
import {
  Sparkles,
  DollarSign,
  Info,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Call } from "./booking-card";

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

const formatLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();

const PRIORITIZED_REQUIREMENTS = ["propertyType", "square_footage"];

// ----------------------------------------------------------------------
// CallTab
// ----------------------------------------------------------------------
export default function CallTab({ calls }: { calls: Call[] }) {
  const [activeCallId, setActiveCallId] = useState<string | null>(
    calls[0]?.id || null,
  );

  const activeCall = calls.find((c) => c.id === activeCallId) || calls[0];

  if (!activeCall?.intelligence) return null;

  return (
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
              <Sparkles className="w-4 h-4 text-[#007AFF]" /> AI Call Summary
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
                src={activeCall.audioUrl}
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
  );
}