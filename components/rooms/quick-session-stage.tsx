"use client";

import React, { useRef, useState } from "react";
import { useRoomContext } from "@/context/room-context";
import {
  VideoTrack,
  useTracks,
  RoomAudioRenderer,
  isTrackReference,
  type TrackReference,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  Settings,
  Mic,
  MicOff,
  Video,
  Share2,
  Check,
  Zap,
  LayoutTemplate,
  ScanEye,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export const QuickSessionStage = () => {
  const {
    sendData,
    room,
    toggleTranscription,
    isTranscribing,
    liveScopeItems,
    triggerSpotter,
    isSpotting
  } = useRoomContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // --- TRACKS ---
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);
  const localTrack = tracks.find(
    (t) => t.participant.isLocal && isTrackReference(t)
  ) as TrackReference | undefined;
  
  // In a Quick Session, we might expect a client, or we might be solo recording.
  const remoteTrack = tracks.find(
    (t) => !t.participant.isLocal && isTrackReference(t)
  ) as TrackReference | undefined;

  // --- ACTIONS ---
  const copyInvite = () => {
    if (!room) return;
    const url = `${window.location.origin}/meet/${room.name}?role=client`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- TOOLBAR HELPER ---
  const ToolButton = ({
    icon: Icon,
    label,
    isActive = false,
    onClick,
    colorClass,
  }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-full p-2.5 rounded-xl transition-all duration-200 group bg-white border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200",
        isActive && "bg-blue-50 border-blue-300"
      )}
    >
      <Icon
        size={20}
        className={cn(
          "mb-1",
          colorClass || (isActive ? "text-blue-600" : "text-slate-500")
        )}
      />
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden gap-4 p-4 bg-slate-50">
      <RoomAudioRenderer />

      {/* --- LEFT: CANVAS (Blue Theme) --- */}
      <div className="flex-1 relative flex flex-col overflow-hidden rounded-2xl shadow-xl border border-blue-200 bg-white">
        
        {/* Quick Session Header */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3 pointer-events-none">
          <div className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-blue-400/30">
            <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              Quick Session
            </span>
            <div className="w-px h-3 bg-white/20 mx-1" />
            <span className="text-[9px] text-blue-100 font-mono">
              {room?.name || "CONNECTING"}
            </span>
          </div>
        </div>

        {/* Main Video Area */}
        <div ref={containerRef} className="relative flex-1 w-full h-full bg-slate-900 overflow-hidden">
          {remoteTrack ? (
            <VideoTrack trackRef={remoteTrack} className="w-full h-full object-contain" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6 bg-slate-50">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <LayoutTemplate className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                  Ready for Walkthrough
                </p>
                <button 
                    onClick={copyInvite}
                    className="mt-4 px-4 py-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition"
                >
                    {copied ? "Link Copied!" : "Copy Client Link"}
                </button>
              </div>
            </div>
          )}

          {/* Self View (PIP) */}
          <div className="absolute bottom-4 right-4 w-40 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg z-30 bg-black">
            {localTrack ? (
              <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <Video size={16} className="text-zinc-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT: STREAMLINED CONTROLS --- */}
      <div className="w-full lg:w-64 flex lg:flex-col gap-4 shrink-0">
        
        {/* Controls Grid */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <ToolButton
            icon={copied ? Check : Share2}
            label={copied ? "Link Copied" : "Invite Client"}
            onClick={copyInvite}
            colorClass="text-blue-500"
          />
          <ToolButton
            icon={isTranscribing ? Mic : MicOff}
            label={isTranscribing ? "Recording" : "Start Record"}
            isActive={isTranscribing}
            onClick={toggleTranscription}
            colorClass={isTranscribing ? "text-red-500" : ""}
          />
           <ToolButton
            icon={isSpotting ? Loader2 : ScanEye}
            label={isSpotting ? "Analyzing..." : "AI Spotter"}
            onClick={triggerSpotter}
            isActive={isSpotting}
            isDisabled={isSpotting}
            colorClass={isSpotting ? "text-purple-500 animate-spin" : "text-purple-600"}
          />
           <ToolButton
            icon={Settings}
            label="Settings"
            onClick={() => {}}
          />
        </div>

        {/* Live Intel Feed (Simplified for Quick Mode) */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Session Intel
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {liveScopeItems.length > 0 ? (
                liveScopeItems.map((item) => (
                    <div key={item.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="font-bold text-blue-600 block text-[10px] uppercase">{item.category}</span>
                        <span className="text-slate-700">{item.item}</span>
                    </div>
                ))
            ) : (
                <div className="text-center mt-10 opacity-40">
                    <Zap className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-[10px] text-slate-400">AI is listening for scope items...</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};