import { Phone, Clock, AudioLines } from "lucide-react";

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
  const meta = msg.metadata || {};
  const isProcessing = meta.status === "PROCESSING" || !meta.audioUrl;

  // Optional: Determine if it was Inbound or Outbound for the icon
  const isInbound = meta.callDirection === "INBOUND";

  if (isProcessing) {
    return (
      <div className="flex flex-col w-full min-w-[260px] max-w-[300px] bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Animated Pulse Icon */}
          <div className="relative flex h-10 w-10 items-center justify-center bg-emerald-500/20 rounded-full shrink-0">
            <AudioLines size={18} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-emerald-700 dark:text-emerald-400">
              Live Call in Progress
            </span>
            {meta.roomName ? (
              <span className="text-[11px] font-mono text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                {meta.roomName}
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                Connecting audio...
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // COMPLETED STATE
  return (
    <div className="flex flex-col w-full min-w-[260px] max-w-[300px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0">
            <Phone size={13} className="text-zinc-600 dark:text-zinc-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">
              {isInbound ? "Inbound Call" : "Outbound Call"}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Ended
            </span>
          </div>
        </div>

        {meta.duration && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
            <Clock size={12} />
            {meta.duration}s
          </div>
        )}
      </div>

      {/* Audio Player Footer */}
      <div className="pt-3">
        {meta.audioUrl ? (
          <audio
            controls
            src={meta.audioUrl}
            // Optional: CSS to make the default HTML5 audio player look slightly better
            className="h-8 w-full outline-none [&::-webkit-media-controls-panel]:bg-zinc-100 dark:[&::-webkit-media-controls-panel]:bg-zinc-800"
          />
        ) : (
          <div className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg py-2">
            <span className="text-[12px] italic text-zinc-500 dark:text-zinc-400">
              No recording available.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}