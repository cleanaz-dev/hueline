"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  CheckCircle2,
  MinusCircle,
  XCircle,
  FileText,
  SquareFunction,
  Sparkles,
  Layers,
  Hash,
  Tag,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCallReason,
  getEstimatedValueRange,
} from "@/lib/utils/dashboard-utils";
import { CallOutcome } from "@/app/generated/prisma";

// --- CONFIG & UTILS ---
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

const formatLabel = (key: string) => {
  const cleanKey = key.replace(/^(is_|has_|requires_)/, "");
  return cleanKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// --- AUDIO PLAYER COMPONENT ---
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
      if (audio.duration)
        setProgress((audio.currentTime / audio.duration) * 100);
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
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
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

interface IntelCallProps {
  call: any; 
}

export function IntelCall({ call }: IntelCallProps) {
  const intel = call.intelligence;
  const date = new Date(call.createdAt);
  const outcome = intel?.callOutcome as CallOutcome | undefined;
  const outcomeStyle = outcome ? outcomeConfig[outcome] : outcomeConfig.NEUTRAL;
  const customFields = (intel?.customFields as Record<string, any>) || {};
  const estimatedValue = intel?.estimatedAdditionalValue || 0;
  const hasValue = estimatedValue > 0;

  // Filter Logic
  const validEntries = Object.entries(customFields).filter(([_, val]) => {
    if (val === null || val === undefined) return false;
    if (val === false) return false;
    if (val === "") return false;
    if (val === 0) return false;
    return true;
  });

  const booleanFlags = validEntries.filter(
    ([_, val]) => typeof val === "boolean"
  );
  const dataPoints = validEntries.filter(
    ([_, val]) => typeof val !== "boolean"
  );

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 mb-4">
      {/* CARD HEADER */}
      <div className="px-4 py-3 border-b border-slate-50 flex flex-wrap justify-between items-center gap-2 bg-slate-50/30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white border border-slate-200 rounded-md shadow-sm">
             <Phone className="w-4 h-4 text-slate-600" />
          </div>
          <span className="font-semibold text-sm text-slate-900">
            {formatCallReason(intel?.callReason || "General Inquiry")}
          </span>
          {outcome && (
            <span
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider",
                outcomeStyle.bg,
                outcomeStyle.border,
                outcomeStyle.color
              )}
            >
              <outcomeStyle.icon className="w-3 h-3" />
              {outcomeStyle.label}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end leading-tight">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
             </span>
             <span className="text-[10px] font-medium text-slate-400 tabular-nums">
                {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
             </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Audio Player */}
        {call.audioUrl && <MinimalAudioPlayer url={call.audioUrl} />}

        {/* Call Summary (Refactored) */}
        {intel?.callSummary && (
          <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100/50">
                <FileText className="w-3 h-3 text-indigo-600" />
              </div>
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                Call Summary
              </h4>
            </div>
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed pl-7">
              {intel.callSummary}
            </p>
          </div>
        )}

        {/* Cost Breakdown (Refactored) */}
        {intel?.costBreakdown && (
          <div className="bg-cyan-50/30 border border-cyan-100 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-100/50">
                <SquareFunction className="w-3 h-3 text-cyan-600" />
              </div>
              <h4 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
                Cost Breakdown
              </h4>
            </div>
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed pl-7">
              {intel.costBreakdown}
            </p>
          </div>
        )}

        {/* Found Value */}
        {hasValue && (
          <div className="bg-emerald-50 border border-emerald-100/60 rounded-lg p-3 sm:px-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800">
             
              <span className="text-xs font-bold uppercase tracking-wider">
                Found Value
              </span>
            </div>
            <div className="text-lg font-bold text-emerald-700 tracking-tight">
              +{getEstimatedValueRange(estimatedValue)}
            </div>
          </div>
        )}

        {/* Detected Details */}
        {validEntries.length > 0 && (
          <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Detected Details
              </h5>
            </div>

            <div className="space-y-3">
              {booleanFlags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {booleanFlags.map(([key]) => (
                    <div
                      key={key}
                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1.5 text-indigo-500" />
                      {formatLabel(key)}
                    </div>
                  ))}
                </div>
              )}

              {dataPoints.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {dataPoints.map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-white p-2.5 rounded border border-slate-200/60 shadow-sm flex flex-col justify-center"
                    >
                      <span className="text-[10px] uppercase tracking-wide text-slate-400 font-bold mb-0.5 flex items-center gap-1.5">
                        {typeof value === "number" ? (
                          <Hash className="w-3 h-3" />
                        ) : (
                          <Tag className="w-3 h-3" />
                        )}
                        {formatLabel(key)}
                      </span>
                      <span
                        className="text-xs font-semibold text-slate-800 truncate"
                        title={String(value)}
                      >
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
  );
}