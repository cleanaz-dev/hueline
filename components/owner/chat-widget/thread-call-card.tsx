"use client";

import { Phone, Clock, Loader2 } from "lucide-react";

interface ThreadCallCardProps {
  msg: {
    body?: string;
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
  const meta = msg.metadata || {};
  const isProcessing = meta.status === "PROCESSING" || !meta.audioUrl;
  const isInbound = meta.callDirection === "INBOUND";

  // 🔴 LIVE / PROCESSING STATE
  if (isProcessing) {
    return (
      <div className="flex flex-col pt-1">
        {/* Render text if there are transcripts/notes in the future */}
        {msg.body && msg.body !== "Live Call in Progress..." && (
          <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-[14px] mb-3">
            {msg.body}
          </div>
        )}
        
        {/* Flush bottom section */}
        <div className="flex items-center gap-3 -mx-4 -mb-3 px-4 pt-3 pb-3.5 bg-background/60 dark:bg-background/40 border-t border-current/10 rounded-b-2xl opacity-90">
          <Loader2 size={16} className="animate-spin text-current opacity-70" />
          <div className="flex flex-col">
            <span className="text-[13px] italic font-medium">
              {isInbound ? "Inbound call in progress..." : "Outbound call in progress..."}
            </span>
            <span className="text-[11px] opacity-70 mt-0.5">
              Audio recording will appear here when ended.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 🟢 COMPLETED STATE
  return (
    <div className="flex flex-col pt-1 min-w-[260px]">
      {/* Render text if there are transcripts/notes in the future (ignores default "Call Ended") */}
      {msg.body && msg.body !== "Call Ended" && (
        <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-[14px] mb-3">
          {msg.body}
        </div>
      )}

      {/* Flush bottom section */}
      <div className="flex flex-col gap-3 -mx-4 -mb-3 px-4 pt-3 pb-3.5 bg-background/60 dark:bg-background/40 border-t border-current/10 rounded-b-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-foreground/5 dark:bg-background/50 shrink-0">
              <Phone size={13} className="opacity-70" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-foreground">
                {isInbound ? "Inbound Call" : "Outbound Call"}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Ended
              </span>
            </div>
          </div>

          {meta.duration && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-foreground/5 dark:bg-background/50 px-2 py-1 rounded-md">
              <Clock size={12} />
              {meta.duration}s
            </div>
          )}
        </div>

        {/* Audio Player */}
        <div className="pt-1">
          {meta.audioUrl ? (
            <audio
              controls
              src={meta.audioUrl}
              className="h-8 w-full outline-none [&::-webkit-media-controls-panel]:bg-background/50 dark:[&::-webkit-media-controls-panel]:bg-background/30 rounded-md"
            />
          ) : (
            <div className="flex items-center justify-center bg-foreground/5 dark:bg-background/50 rounded-lg py-2">
              <span className="text-[12px] italic text-muted-foreground">
                No recording available.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}