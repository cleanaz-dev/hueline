"use client"
import { Pause, Play } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils"; // Assuming you have this from shadcn, otherwise remove cn

export const AudioPlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="group flex items-center gap-3 w-full max-w-[300px] transition-opacity hover:opacity-100 opacity-90">
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      {/* Play/Pause Button - Circle Outline Style */}
      <button
        onClick={togglePlay}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1",
          isPlaying 
            ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
            : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
        )}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3 fill-current" />
        ) : (
          <Play className="w-3 h-3 fill-current ml-0.5" />
        )}
      </button>

      {/* Progress Bar & Time */}
      <div className="flex flex-col justify-center flex-1 gap-1">
        
        {/* The Seek Bar */}
        <div className="relative h-1 w-full bg-slate-100 rounded-full cursor-pointer group/slider overflow-visible">
          {/* Background Track */}
          <div 
            className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          
          {/* Invisible Range Input for Dragging */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          {/* Hover Thumb (Optional - adds nice interaction) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-indigo-600 rounded-full shadow-sm opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
          />
        </div>

        {/* Minimal Time Stamps */}
        <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 font-mono leading-none">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};