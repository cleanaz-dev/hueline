"use client";

import {
  X,
  Play,
  Pause,
  Calendar,
  Clock,
  Home,
  Building2,
  CheckCircle2,
  MinusCircle,
  XCircle,
  TrendingUp,
  FileText,
  Tag,
  Hash,
  Layers,
  Sparkles
} from "lucide-react";
import { BookingData } from "@/types/subdomain-type";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  formatCallReason,
  formatProjectScope,
  getEstimatedValueRange,
} from "@/lib/utils/dashboard-utils";
import { CallOutcome } from "@/app/generated/prisma";

interface IntelligenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingData;
}

// --- CONFIGURATION ---
const outcomeConfig = {
  POSITIVE: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    label: "Positive",
  },
  NEUTRAL: {
    icon: MinusCircle,
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: "Neutral",
  },
  NEGATIVE: {
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    label: "Negative",
  },
};

// --- UTILS ---
const formatLabel = (key: string) => {
  const cleanKey = key.replace(/^(is_|has_|requires_)/, "");
  return cleanKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// --- AUDIO PLAYER ---
const MinimalAudioPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateProgress = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => setIsPlaying(false));
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  return (
    <div className="flex items-center gap-3 w-full bg-slate-50 rounded-lg p-2 pr-4 border border-slate-100/50">
      <audio ref={audioRef} src={url} className="hidden" />
      <button
        onClick={togglePlay}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full border transition-all focus:outline-none shrink-0",
          isPlaying 
            ? "border-indigo-200 bg-indigo-50 text-indigo-600" 
            : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
        )}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="relative h-1 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function IntelligenceDialog({
  isOpen,
  onClose,
  booking,
}: IntelligenceDialogProps) {
  if (!isOpen) return null;

  const sortedCalls = useMemo(() => 
    [...(booking.calls || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), 
  [booking.calls]);

  const totalValue = sortedCalls.reduce(
    (sum, c) => sum + (c.intelligence?.estimatedAdditionalValue || 0),
    0
  );
  
  const scope = booking.currentProjectScope || "UNKNOWN";
  const type = (booking as any).projectType || "RESIDENTIAL";
  const TypeIcon = type === "COMMERCIAL" ? Building2 : Home;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {booking.name}
              </h3>
              <div className="hidden sm:flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 items-center gap-1 uppercase tracking-wide">
                <TypeIcon className="w-3 h-3" />
                {formatProjectScope(scope)}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {sortedCalls.length} Interaction{sortedCalls.length !== 1 && 's'}
              </span>
              {totalValue > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{getEstimatedValueRange(totalValue)} Value Identified
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
          <div className="space-y-8">
            {sortedCalls.map((call, index) => {
              const intel = call.intelligence;
              const date = new Date(call.createdAt);
              const outcome = intel?.callOutcome as CallOutcome | undefined;
              const outcomeStyle = outcome ? outcomeConfig[outcome] : outcomeConfig.NEUTRAL;
              const customFields = (intel?.customFields as Record<string, any>) || {};
              const estimatedValue = intel?.estimatedAdditionalValue || 0;
              const hasValue = estimatedValue > 0;

              // Filter Logic: Remove null, false, empty, 0
              const validEntries = Object.entries(customFields).filter(([_, val]) => {
                if (val === null || val === undefined) return false;
                if (val === false) return false;
                if (val === "") return false;
                if (val === 0) return false;
                return true;
              });

              const booleanFlags = validEntries.filter(([_, val]) => typeof val === "boolean");
              const dataPoints = validEntries.filter(([_, val]) => typeof val !== "boolean");

              return (
                <div key={call.id} className="relative pl-4 sm:pl-0">
                  <div className="hidden sm:block absolute left-[3px] top-4 bottom-0 w-[2px] bg-slate-100 -z-10" />
                  
                  <div className="flex gap-4">
                    <div className="hidden sm:flex flex-col items-center mt-1">
                      <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white ${index === 0 ? "bg-indigo-500" : "bg-slate-300"}`} />
                    </div>

                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                      
                      {/* CARD HEADER: Reason + Outcome */}
                      <div className="px-4 py-3 border-b border-slate-50 flex flex-wrap justify-between items-center gap-2 bg-slate-50/30">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-sm text-slate-900">
                            {formatCallReason(intel?.callReason || "General Inquiry")}
                          </span>
                          {outcome && (
                            <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider", outcomeStyle.bg, outcomeStyle.border, outcomeStyle.color)}>
                              <outcomeStyle.icon className="w-3 h-3" />
                              {outcomeStyle.label}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 tabular-nums">
                           {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        
                        {/* 1. AUDIO PLAYER */}
                        {call.audioUrl && <MinimalAudioPlayer url={call.audioUrl} />}

                        {/* 2. CALL SUMMARY */}
                        {intel?.callSummary && (
                          <div className="flex gap-3">
                            <div className="shrink-0 mt-0.5">
                               <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                               </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {intel.callSummary}
                            </p>
                          </div>
                        )}

                        {/* 3. FOUND VALUE BOX (Conditionally Rendered if > 0) */}
                        {hasValue && (
                          <div className="bg-emerald-50 border border-emerald-100/60 rounded-lg p-3 sm:px-4 flex items-center justify-between shadow-sm">
                             <div className="flex items-center gap-2 text-emerald-800">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold uppercase tracking-wider">Found Value</span>
                             </div>
                             <div className="text-lg font-bold text-emerald-700 tracking-tight">
                                +{getEstimatedValueRange(estimatedValue)}
                             </div>
                          </div>
                        )}

                        {/* 4. DETECTED DETAILS (Only if data exists - No Summary/Text) */}
                        {validEntries.length > 0 && (
                          <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-3">
                               <Layers className="w-3.5 h-3.5 text-slate-400" />
                               <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                 Detected Details
                               </h5>
                            </div>

                            <div className="space-y-3">
                              {/* Boolean Flags */}
                              {booleanFlags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {booleanFlags.map(([key]) => (
                                    <div key={key} className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700">
                                      <CheckCircle2 className="w-3 h-3 mr-1.5 text-indigo-500" />
                                      {formatLabel(key)}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Data Points (Strings/Numbers) */}
                              {dataPoints.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                  {dataPoints.map(([key, value]) => (
                                    <div key={key} className="bg-white p-2.5 rounded border border-slate-200/60 shadow-sm flex flex-col justify-center">
                                      <span className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-0.5 flex items-center gap-1.5">
                                         {typeof value === 'number' ? <Hash className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                                         {formatLabel(key)}
                                      </span>
                                      <span className="text-xs font-semibold text-slate-800 truncate" title={String(value)}>
                                        {String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedCalls.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm">No call history recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 p-4 border-t border-slate-100 bg-white flex justify-end">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close Viewer
          </Button>
        </div>
      </div>
    </div>
  );
}