// components/chat/thread-call-card.tsx
import { Phone, Clock } from "lucide-react";

interface ThreadCallCardProps {
  msg: {
    metadata?: {
      status?: string | null;
      callDirection?: string | null;
      audioUrl?: string | null;
      duration?: string | null;
      roomName?: string | null;
    } | null;
  };
}

export default function ThreadCallCard({ msg }: ThreadCallCardProps) {
  // 1. Safely default to an empty object if metadata is null/undefined
  const meta = msg.metadata || {};
  
  // 2. If status is processing OR audioUrl is missing, we assume it's live/processing
  const isProcessing = meta.status === "PROCESSING" || !meta.audioUrl;

  return (
    <div className="flex flex-col gap-3 min-w-[240px] w-full">
      {isProcessing ? (
        // LIVE / PROCESSING STATE (No audio or duration needed here)
        <div className="flex items-center gap-3 py-1">
          <div className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-500">
              Live Call in Progress...
            </span>
            {meta.roomName && (
              <span className="text-[11px] opacity-70 font-mono">
                Room: {meta.roomName}
              </span>
            )}
          </div>
        </div>
      ) : (
        // COMPLETED STATE (Safely checks for duration and audioUrl before rendering)
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-2 border-b border-current/10 pb-2">
            <Phone size={14} className="opacity-70" />
            <span className="text-[14px] font-medium">Call Ended</span>
            
            {/* Safely renders ONLY if duration is not null */}
            {meta.duration && (
              <div className="flex items-center gap-1 ml-auto text-[12px] opacity-80 bg-current/5 px-2 py-0.5 rounded-full">
                <Clock size={12} />
                <span>{meta.duration}s</span>
              </div>
            )}
          </div>

          {/* Safely renders ONLY if audioUrl is not null */}
          {meta.audioUrl ? (
            <audio
              controls
              src={meta.audioUrl}
              className="h-9 w-full max-w-[280px] rounded-md outline-none"
            />
          ) : (
            <span className="text-[12px] italic opacity-60">
              No recording available.
            </span>
          )}
        </div>
      )}
    </div>
  );
}