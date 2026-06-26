"use client";

import { Phone, Clock, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusher/pusher-client"; // Make sure this path matches yours

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
  threadId?: string; // 👈 NEW: Pass this in from your chat map!
}

export default function ThreadCallCard({ msg, threadId }: ThreadCallCardProps) {
  const meta = msg.metadata || {};
  const isProcessing = meta.status === "PROCESSING" || !meta.audioUrl;
  const isInbound = meta.callDirection === "INBOUND";

  // --- LIVE TRANSCRIPT STATE ---
  const [liveLines, setLiveLines] = useState<Array<{ role: string; text: string }>>([]);
  const [currentStream, setCurrentStream] = useState<{ role: string; text: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new words appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveLines, currentStream]);

  // Bind Pusher ONLY when the call is live
  useEffect(() => {
    if (!isProcessing || !threadId) return;

    const channelName = `thread-${threadId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("live-transcript", (data: { text: string; isFinal: boolean; role: string }) => {
      if (data.isFinal) {
        setLiveLines((prev) => [...prev, { text: data.text, role: data.role }]);
        setCurrentStream(null);
      } else {
        setCurrentStream({ text: data.text, role: data.role });
      }
    });

    return () => {
      channel.unbind("live-transcript");
      pusherClient.unsubscribe(channelName);
    };
  }, [isProcessing, threadId]);

  // 🔴 LIVE / PROCESSING STATE
  if (isProcessing) {
    return (
      <div className="flex flex-col pt-1 min-w-[260px] w-full">
        {/* Render initial body if exists */}
        {msg.body && msg.body !== "Live Call in Progress..." && (
          <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-[14px] mb-2">
            {msg.body}
          </div>
        )}

        {/* 🎙️ LIVE TRANSCRIPT UI (Terminal Style) */}
        {threadId && (
          <div 
            ref={scrollRef}
            className="flex flex-col gap-1.5 p-3 mb-0 bg-black/80 dark:bg-black/50 text-white rounded-t-xl h-[120px] overflow-y-auto scrollbar-thin text-[12px] font-mono shadow-inner border border-white/10"
          >
            {liveLines.map((line, i) => (
              <div key={i} className="leading-snug">
                <span className={line.role === "AI" ? "text-blue-400" : "text-green-400"}>
                  {line.role === "AI" ? "AI" : "CLIENT"}:
                </span>{" "}
                <span className="opacity-90">{line.text}</span>
              </div>
            ))}
            
            {currentStream && (
              <div className="leading-snug opacity-80">
                <span className={currentStream.role === "AI" ? "text-blue-400" : "text-green-400"}>
                  {currentStream.role === "AI" ? "AI" : "CLIENT"}:
                </span>{" "}
                <span>
                  {currentStream.text}
                  <span className="animate-pulse">_</span>
                </span>
              </div>
            )}

            {!liveLines.length && !currentStream && (
              <div className="text-white/40 italic flex items-center h-full justify-center">
                Listening for speech...
              </div>
            )}
          </div>
        )}
        
        {/* Flush bottom section (adjusted rounding to fit the transcript box) */}
        <div className={`flex items-center gap-3 -mx-4 -mb-3 px-4 pt-3 pb-3.5 bg-background/60 dark:bg-background/40 border-t border-current/10 rounded-b-2xl opacity-90 ${!threadId && "rounded-t-2xl"}`}>
          <Loader2 size={16} className="animate-spin text-current opacity-70 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[13px] italic font-medium">
              {isInbound ? "Inbound call in progress..." : "Outbound call in progress..."}
            </span>
            <span className="text-[11px] opacity-70 mt-0.5 line-clamp-1">
              Audio recording will appear here when ended.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 🟢 COMPLETED STATE (Untouched!)
  return (
    <div className="flex flex-col pt-1 min-w-[260px]">
      {msg.body && msg.body !== "Call Ended" && (
        <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-[14px] mb-3">
          {msg.body}
        </div>
      )}

      <div className="flex flex-col gap-3 -mx-4 -mb-3 px-4 pt-3 pb-3.5 bg-background/60 dark:bg-background/40 border-t border-current/10 rounded-b-2xl overflow-hidden">
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