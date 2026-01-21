"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play, Pause, CheckCircle2, MinusCircle, XCircle, FileText,
  SquareFunction, Layers, Hash, Tag, Phone, ChevronDown, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCallReason, getEstimatedValueRange } from "@/lib/utils/dashboard-utils";
import { CallOutcome } from "@/app/generated/prisma";

// --- CONFIG ---
const outcomeConfig = {
  POSITIVE: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", label: "Positive" },
  NEUTRAL: { icon: MinusCircle, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", label: "Neutral" },
  NEGATIVE: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", label: "Negative" },
};

const formatLabel = (key: string) => key.replace(/^(is_|has_|requires_)/, "").split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// --- AUDIO PLAYER ---
const MinimalAudioPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => audio.duration && setProgress((audio.currentTime / audio.duration) * 100);
    const end = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", end);
    return () => { audio.removeEventListener("timeupdate", update); audio.removeEventListener("ended", end); };
  }, []);

  return (
    <div className="flex items-center gap-3 w-full bg-slate-50 rounded-lg p-2 pr-4 border border-slate-200/60 shadow-inner">
      <audio ref={audioRef} src={url} />
      <button
        onClick={(e) => { e.stopPropagation(); if(audioRef.current) isPlaying ? audioRef.current.pause() : audioRef.current.play(); setIsPlaying(!isPlaying); }}
        className={cn("flex items-center justify-center w-8 h-8 rounded-full border transition-all shrink-0 shadow-sm", isPlaying ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300")}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

interface IntelCallProps { call: any; }

export function IntelCall({ call }: IntelCallProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default
  const intel = call.intelligence;
  const date = new Date(call.createdAt);
  const outcome = (intel?.callOutcome as CallOutcome) || "NEUTRAL";
  const style = outcomeConfig[outcome] || outcomeConfig.NEUTRAL;
  const estimatedValue = intel?.estimatedAdditionalValue || 0;
  
  // Parse Custom Fields
  const customFields = (intel?.customFields as Record<string, any>) || {};
  const validEntries = Object.entries(customFields).filter(([_, v]) => v !== null && v !== false && v !== "" && v !== 0);
  const booleanFlags = validEntries.filter(([_, v]) => typeof v === "boolean");
  const dataPoints = validEntries.filter(([_, v]) => typeof v !== "boolean");

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md mb-3 overflow-hidden">
      {/* HEADER (TRIGGER) */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 cursor-pointer bg-white hover:bg-slate-50/50 transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-full flex items-center justify-center border", style.bg, style.border)}>
            <Phone className={cn("w-4 h-4", style.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-sm text-slate-900">{formatCallReason(intel?.callReason || "Inquiry")}</span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider", style.bg, style.border, style.color)}>
                {style.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
               <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400"/> {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
               <span className="text-slate-300">•</span>
               <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {estimatedValue > 0 && !isExpanded && (
             <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                +{getEstimatedValueRange(estimatedValue)}
             </span>
           )}
           <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", isExpanded && "rotate-180")} />
        </div>
      </div>

      {/* EXPANDABLE BODY */}
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="p-4 pt-0 space-y-4 border-t border-slate-50 bg-slate-50/30">
            <div className="h-2"></div> {/* Spacer */}
            
            {call.audioUrl && <MinimalAudioPlayer url={call.audioUrl} />}

            <div className="grid grid-cols-1 gap-4">
              {intel?.callSummary && (
                <div className="space-y-1.5">
                   <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Summary
                   </h5>
                   <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                      {intel.callSummary}
                   </p>
                </div>
              )}
              
              {(intel?.costBreakdown || estimatedValue > 0) && (
                 <div className="flex flex-col sm:flex-row gap-3">
                    {intel?.costBreakdown && (
                      <div className="flex-1 space-y-1.5">
                         <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <SquareFunction className="w-3 h-3" /> Cost Breakdown
                         </h5>
                         <p className="text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg shadow-sm">
                            {intel.costBreakdown}
                         </p>
                      </div>
                    )}
                    {estimatedValue > 0 && (
                      <div className="sm:w-1/3 space-y-1.5">
                         <h5 className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">Est. Value</h5>
                         <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-emerald-700 font-bold text-lg text-center shadow-sm">
                            +{getEstimatedValueRange(estimatedValue)}
                         </div>
                      </div>
                    )}
                 </div>
              )}
            </div>

            {validEntries.length > 0 && (
              <div className="pt-2 border-t border-slate-100 mt-2">
                <div className="flex flex-wrap gap-2">
                  {booleanFlags.map(([key]) => (
                    <span key={key} className="inline-flex items-center px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-sm">
                      <CheckCircle2 className="w-3 h-3 mr-1.5 text-indigo-500" /> {formatLabel(key)}
                    </span>
                  ))}
                  {dataPoints.map(([key, value]) => (
                    <span key={key} className="inline-flex items-center px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 shadow-sm" title={`${key}: ${value}`}>
                       {typeof value === "number" ? <Hash className="w-3 h-3 mr-1.5 text-slate-400" /> : <Tag className="w-3 h-3 mr-1.5 text-slate-400" />}
                       <span className="text-slate-400 mr-1">{formatLabel(key)}:</span> {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}