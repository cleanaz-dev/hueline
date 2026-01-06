"use client"
import { Pause, Play, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  url: string | null; // Allow null
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
}

export const AudioPlayer = ({ 
  url, 
  isPlaying, 
  isLoading,
  onPlayPause 
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Control audio playback based on isPlaying prop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) {
      return;
    }

    if (isPlaying) {
      audio.currentTime = 0;
      audio.play()
        .then(() => console.log("Audio playing successfully"))
        .catch(err => {
          console.error("Failed to play audio:", err);
        });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isPlaying, url]);

  return (
    <div className="group flex items-center gap-3 w-full max-w-[300px] transition-opacity hover:opacity-100 opacity-90 ">
      {/* Only render audio element if we have a presigned URL */}
      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onEnded={onPlayPause}
          onError={(e) => {
            console.error("Audio playback error:", e.currentTarget.error);
          }}
          className="hidden"
        />
      )}
      
      <button
        onClick={onPlayPause}
        disabled={isLoading}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1 cursor-pointer",
          isLoading && "cursor-wait opacity-50",
          isPlaying 
            ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
            : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-3 h-3 fill-current" />
        ) : (
          <Play className="w-3 h-3 fill-current ml-0.5" />
        )}
      </button>
    </div>
  );
};