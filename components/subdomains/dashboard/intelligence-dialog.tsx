"use client";

import {
  X,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import { BookingData } from "@/types/subdomain-type";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useRef } from "react";
import {
  formatCallReason,
  formatProjectScope,
  getEstimatedValueRange,
} from "@/lib/utils/dashboard-utils";

interface IntelligenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingData;
}

// Simple internal Audio Player for the dialog
const DialogPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const ref = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-3 border border-gray-100">
      <button
        onClick={() => {
          if (isPlaying) ref.current?.pause();
          else ref.current?.play();
          setIsPlaying(!isPlaying);
        }}
        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-blue-600" />
        ) : (
          <Play className="w-4 h-4 text-blue-600 ml-0.5" />
        )}
      </button>
      <div className="flex-1">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-blue-500 w-full origin-left transition-transform duration-[10s] ease-linear ${
              isPlaying ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </div>
      </div>
      <audio
        ref={ref}
        src={url}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default function IntelligenceDialog({
  isOpen,
  onClose,
  booking,
}: IntelligenceDialogProps) {
  if (!isOpen) return null;

  // 1. Sort Calls (Newest First)
  const sortedCalls = [...(booking.calls || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 2. Calculate Stats for Header
  const totalValue = sortedCalls.reduce(
    (sum, c) => sum + (c.intelligence?.estimatedAdditionalValue || 0),
    0
  );
  const scope = booking.currentProjectScope || "UNKNOWN";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER: High Level Summary */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">
                {booking.name}
              </h3>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                {formatProjectScope(scope)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {sortedCalls.length} Interactions
              </span>
              {totalValue > 0 && (
                <span className="flex items-center gap-1.5 text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  + {getEstimatedValueRange(totalValue)} Opportunity
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY: Timeline */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          <div className="space-y-6">
            {sortedCalls.map((call, index) => {
              const intel = call.intelligence;
              const date = new Date(call.createdAt);

              return (
                <div
                  key={call.id}
                  className="relative pl-6 border-l-2 border-gray-200 last:border-0 pb-6 last:pb-0"
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      index === 0 ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />

                  {/* Call Card */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Card Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">
                          {formatCallReason(intel?.callReason || "Unknown")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {date.toLocaleDateString()} at{" "}
                        {date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Audio Player */}
                      {call.audioUrl && <DialogPlayer url={call.audioUrl} />}

                      {/* Intelligence Block */}
                      {intel && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left: Hidden Needs Checklist */}
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">
                              Scope Detection
                            </h5>
                            <div className="space-y-2">
                              <ScopeItem
                                label="Surface Prep"
                                active={intel.surfacePrepNeeds}
                              />
                              <ScopeItem
                                label="Structural Repair"
                                active={intel.structuralNeeds}
                              />
                              <ScopeItem
                                label="Technical / Access"
                                active={intel.technicalNeeds}
                              />
                            </div>
                          </div>

                          {/* Right: Value & Summary */}
                          <div className="flex flex-col justify-between">
                            {intel.estimatedAdditionalValue > 0 ? (
                              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center mb-2">
                                <div className="text-xs text-green-600 font-medium uppercase">
                                  Est. Value Found
                                </div>
                                <div className="text-lg font-bold text-green-700">
                                  +
                                  {getEstimatedValueRange(
                                    intel.estimatedAdditionalValue
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center mb-2 flex items-center justify-center h-full">
                                <span className="text-xs text-gray-400">
                                  No hidden value detected
                                </span>
                              </div>
                            )}

                            {/* If you save summary text, put it here */}
                            {/* <div className="text-xs text-gray-500 italic">"Client mentioned..."</div> */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedCalls.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                No call history available.
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Small helper for the checklist items
function ScopeItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        active ? "text-gray-900 font-medium" : "text-gray-400"
      }`}
    >
      {active ? (
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
      )}
      {label}
    </div>
  );
}
