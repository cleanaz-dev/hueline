"use client";

import { 
  User, 
  CheckCircle2, 
  Activity,
  DatabaseZap
} from "lucide-react";
import { Room, BookingData } from "@/types/subdomain-type";
import { RoomDetailsTabs, ScopeItem } from "./room-details-tabs";
import { SecureVideoPlayer } from "./video/secure-video-player";

interface RoomDetailsProps {
  room: Room & { booking?: BookingData };
}

export function RoomDetailsView({ room }: RoomDetailsProps) {
  // Normalize data structure if needed
  const scopeItems = (Array.isArray(room.scopeData) 
    ? room.scopeData 
    : (room.scopeData as any)?.items || []) as ScopeItem[];

  const roomId = room?.roomKey;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-7rem)] bg-white">
      
      {/* 1. MINIMAL METADATA TOOLBAR */}
      <header className="flex-none h-12 border-b border-zinc-200 flex items-center justify-between px-4 lg:px-6 bg-white z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
            <User className="w-3.5 h-3.5 text-zinc-400" /> 
            <span className="truncate max-w-[120px] sm:max-w-none">{room.clientName || "Unknown Client"}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" /> 
            <span>Survey Complete</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
           <DatabaseZap className="w-3.5 h-3.5 text-zinc-400" />
           <span className="font-mono font-bold text-zinc-900">{scopeItems.length}</span>
           <span className="text-zinc-400 hidden sm:inline">items captured</span>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        
        {/* LEFT COLUMN (Video Playback) */}
        <div className="w-full lg:flex-1 bg-zinc-50 flex flex-col relative lg:overflow-y-auto">
          {/* 
             Container Flex Logic:
             1. flex-1: Takes up all available vertical space
             2. justify-center: Vertically centers the content (on desktop)
             3. items-center: Horizontally centers the content
          */}
          <div className="flex-1 p-4 lg:p-8 flex flex-col items-center justify-start lg:justify-center min-h-0">
            
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                 <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Session Recording
                 </h2>
                 {room.recordingUrl && (
                   <span className="text-[10px] font-mono text-zinc-400 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                     REC
                   </span>
                 )}
              </div>

              {/* 
                  VIDEO FRAME:
                  - aspect-video: Forces 16:9 ratio based on width
                  - w-full: Takes full width of parent (max-w-5xl)
              */}
              <div className="relative aspect-video w-full bg-zinc-900 rounded-xl lg:rounded-2xl overflow-hidden shadow-xl shadow-zinc-200/50 border border-zinc-200 group ring-1 ring-zinc-900/5">
                {room.recordingUrl ? (
                  /* 
                     FIX IS HERE: 
                     Added `className="w-full h-full"` 
                     This forces the component to fill the aspect-video parent 
                  */
                  <SecureVideoPlayer 
                    roomId={roomId} 
                    className="w-full h-full" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">
                    No recording available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Tabs Component) */}
        <div className="w-full lg:w-[420px] h-[500px] lg:h-full z-20 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:shadow-none border-l border-zinc-200">
          <RoomDetailsTabs items={scopeItems} roomId={roomId} />
        </div>

      </div>
    </div>
  );
}