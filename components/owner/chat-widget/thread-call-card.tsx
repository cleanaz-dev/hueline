"use client";

import { Phone, Clock, Loader2, Activity, X, Bot, PersonStanding } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { pusherClient } from "@/lib/pusher/pusher-client";
import { cn } from "@/lib/utils";

interface ThreadCallCardProps {
  msg: {
    body?: string;
    metadata?: {
      status?: string | null;
      callDirection?: string | null;
      audioS3Key?: string | null;
      duration?: string | null;
      roomName?: string | null;
    } | null;
  };
  threadId?: string;
}

export default function ThreadCallCard({ msg, threadId }: ThreadCallCardProps) {
  const meta = msg.metadata || {};
  const isInbound = meta.callDirection === "INBOUND";

  const [isEnded, setIsEnded] = useState(false);
  const isProcessing = !isEnded && meta.status === "PROCESSING";

  const [liveLines, setLiveLines] = useState<Array<{ role: string; text: string }>>([]);
  const [currentStream, setCurrentStream] = useState<{ role: string; text: string } | null>(null);

  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isTranscriptOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveLines, currentStream, isTranscriptOpen]);

  useEffect(() => {
    if (!threadId) return;

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

    channel.bind("call-ended", () => {
      setIsEnded(true);
      setCurrentStream(null);
      setIsTranscriptOpen(false);
    });

    return () => {
      channel.unbind("live-transcript");
      channel.unbind("call-ended");
      pusherClient.unsubscribe(channelName);
    };
  }, [threadId]);

  // 🔴 LIVE / PROCESSING STATE
  if (isProcessing) {
    return (
      <>
        <div className="flex flex-col pt-1 min-w-[280px] w-full">
          {msg.body && msg.body !== "Live Call in Progress..." && (
            <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-[14px] mb-3">
              {msg.body}
            </div>
          )}

          <div className="flex flex-col gap-3 -mx-4 -mb-3 px-4 pt-3 pb-3.5 bg-background/60 dark:bg-background/40 border-t border-current/10 rounded-b-2xl overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shrink-0">
                  <Phone size={14} className="animate-pulse" />
                  <span className="absolute inline-flex w-full h-full rounded-full bg-blue-400 opacity-20 animate-ping" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-foreground">
                    {isInbound ? "Inbound Call" : "Outbound Call"}
                  </span>
                  <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Live in progress...
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-current/5 mt-1">
              <button
                onClick={() => setIsTranscriptOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-foreground/5 hover:bg-foreground/10 dark:bg-background/50 dark:hover:bg-background/80 rounded-lg text-[12px] font-semibold transition-colors"
              >
                <Activity size={14} className="opacity-70" />
                View Live Transcript
              </button>
            </div>
          </div>
        </div>

        {isTranscriptOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative flex flex-col w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border overflow-hidden h-[80vh] max-h-[600px] animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-600">
                    <Activity size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold leading-none">Live Call Transcript</h3>
                    <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      Listening in real-time
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTranscriptOpen(false)}
                  className="p-2 rounded-full hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-zinc-50/50 dark:bg-zinc-950/50 scrollbar-thin"
              >
                {!liveLines.length && !currentStream && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 opacity-60">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-[13px] italic">Waiting for speech...</span>
                  </div>
                )}

                {liveLines.map((line, i) => {
                  const isAI = line.role === "AI";
                  return (
                    <div key={i} className={cn("flex w-full", isAI ? "justify-start" : "justify-end")}>
                      <div className={cn("flex max-w-[85%] gap-2", isAI ? "flex-row" : "flex-row-reverse")}>
                        <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-background border border-border shadow-sm text-muted-foreground">
                          {isAI ? <Bot size={14} /> : <PersonStanding size={14} />}
                        </div>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm",
                          isAI
                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-500/20 rounded-tl-sm"
                            : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-tr-sm"
                        )}>
                          {line.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {currentStream && (
                  <div className={cn("flex w-full", currentStream.role === "AI" ? "justify-start" : "justify-end")}>
                    <div className={cn("flex max-w-[85%] gap-2 opacity-80", currentStream.role === "AI" ? "flex-row" : "flex-row-reverse")}>
                      <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-background border border-border shadow-sm text-muted-foreground">
                        {currentStream.role === "AI" ? <Bot size={14} /> : <PersonStanding size={14} />}
                      </div>
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm",
                        currentStream.role === "AI"
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-500/20 rounded-tl-sm"
                          : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-tr-sm"
                      )}>
                        {currentStream.text}
                        <span className="inline-block w-1 h-3.5 ml-1 bg-current animate-pulse align-middle" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 🟢 COMPLETED STATE
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
          {meta.audioS3Key ? (
            <audio
              controls
              src={meta.audioS3Key}
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