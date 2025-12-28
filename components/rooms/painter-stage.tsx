"use client";

import React, { useRef, useState } from "react";
import { useRoomContext } from "@/context/room-context";
import {
  VideoTrack,
  useTracks,
  RoomAudioRenderer,
  isTrackReference,
  type TrackReference,
  DisconnectButton,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  Maximize2,
  Sparkles,
  Camera,
  Ruler,
  Settings,
  Mic,
  MicOff,
  FileText,
  Video,
  X,
  Copy,
  Check,
  Share2,
  DatabaseZap,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

interface LiveStageProps {
  slug: string;
  roomId: string;
}

export const PainterStage = ({ slug, roomId }: LiveStageProps) => {
  const {
    laserPosition,
    sendData,
    isPainter,
    triggerAI,
    isGenerating,
    toggleTranscription,
    isTranscribing,
    activeMockupUrl,
    room,
  } = useRoomContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const MOCK_SCOPE_ITEMS = [
    {
      id: 1,
      category: "PREP",
      item: "Baseboards",
      action: "Sand & Patch",
      timestamp: "10:02 AM",
    },
    {
      id: 2,
      category: "PAINT",
      item: "Crown Molding",
      action: "Semi-Gloss (2 Coats)",
      timestamp: "10:05 AM",
    },
    {
      id: 3,
      category: "REPAIR",
      item: "North Wall",
      action: "Drywall Patch",
      timestamp: "10:12 AM",
    },
  ];

  // Fetch Tracks
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);
  const localTrack = tracks.find(
    (t) => t.participant.isLocal && isTrackReference(t)
  ) as TrackReference | undefined;
  const remoteTrack = tracks.find(
    (t) => !t.participant.isLocal && isTrackReference(t)
  ) as TrackReference | undefined;

  // Actions
  const toggleMic = () => {
    if (room?.localParticipant) {
      const newState = !micEnabled;
      room.localParticipant.setMicrophoneEnabled(newState);
      setMicEnabled(newState);
    }
  };

  const copyInvite = () => {
    if (!room) return;
    const url = `${window.location.origin}/meet/${room.name}?role=client`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePointer = (e: React.MouseEvent) => {
    if (!isPainter || !containerRef.current || activeMockupUrl) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    sendData("POINTER", { x, y });
  };

  const handleEndRoom = async () => {
    try {
      const response = await axios.post(
        `/api/subdomain/${slug}/room/${roomId}/crud?action=end`
      );

      if (response.data.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error ending room:", error);
      toast.error("Failed to end room");
    }
  };

  // --- Toolbar Component ---
  // --- Toolbar Component (Light Mode Optimized) ---
  const ToolButton = ({
    icon: Icon,
    label,
    isActive = false,
    isDisabled = false,
    onClick,
    variant = "default",
    colorClass, // Optional override (e.g., text-red-500)
  }: any) => (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-full p-2.5 rounded-xl transition-all duration-200 group bg-muted/50",

        // 1. Base State (White BG friendly)
        isDisabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:bg-zinc-100/80",

        // 2. Text Color (Darker for white bg)
        !isActive && variant !== "primary" && (colorClass || "text-zinc-600"),

        // 3. Active State (Subtle Blue wash)
        isActive && "bg-cyan-50 text-cyan-700",

        // 4. Primary Variant (High contrast pop)
        variant === "primary" &&
          !isDisabled &&
          "bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/20"
      )}
    >
      <div
        className={cn(
          "p-2.5 rounded-xl md:mb-1.5 transition-all duration-200 group-hover:scale-105",

          // Icon Container Logic
          variant === "primary"
            ? "bg-white/10" // Subtle highlight inside the dark primary button
            : cn(
                "bg-white border shadow-sm", // Card-like look for icons
                isActive
                  ? "border-cyan-200 shadow-cyan-100"
                  : "border-zinc-200 shadow-zinc-100 group-hover:border-zinc-300 group-hover:shadow-md"
              )
        )}
      >
        <Icon
          size={variant === "primary" ? 22 : 20}
          strokeWidth={variant === "primary" ? 2.5 : 2}
        />
      </div>

      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider md:block hidden",
          // Ensure text is readable on white
          variant === "primary" ? "text-black" : "opacity-90"
        )}
      >
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]  w-full overflow-hidden">
      <RoomAudioRenderer />

      {/* --- LEFT: MAIN CANVAS (Video) --- */}
      <div className="flex-1 relative flex flex-col p-2 lg:p-4 overflow-hidden">
        {/* Status Bar (Room Name) */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full shadow-xl">
            {/* Status Dot */}
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]",
                remoteTrack
                  ? "bg-green-500 text-green-500 animate-pulse"
                  : "bg-red-500 text-red-500"
              )}
            />

            {/* Room Name */}
            <span className="text-[9px] md:text-xs font-bold text-white tracking-widest uppercase">
              {room?.name || "Initializing..."}
            </span>
          </div>
       

        </div>

        {/* Video Wrapper */}
        <div
          ref={containerRef}
          onClick={handlePointer}
          className="relative flex-1 w-full h-full bg-zinc-950 rounded-2xl overflow-hidden border border-white/10 shadow-md cursor-crosshair group"
        >
          {/* Remote Video (The Feed) */}
          {remoteTrack ? (
            <VideoTrack
              trackRef={remoteTrack}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-t-cyan-500 border-zinc-800 rounded-full animate-spin" />
                <Video
                  className="absolute inset-0 m-auto text-zinc-800"
                  size={24}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Waiting for Camera
                </p>
                <p className="text-xs text-zinc-700 mt-2">
                  Client is connecting...
                </p>
              </div>
            </div>
          )}

          {/* Laser Pointer */}
          {laserPosition && (
            <div
              className="absolute w-12 h-12 -ml-6 -mt-6 border-4 border-cyan-400 rounded-full animate-ping z-50 pointer-events-none shadow-[0_0_30px_rgba(34,211,238,0.8)]"
              style={{
                left: `${laserPosition.x * 100}%`,
                top: `${laserPosition.y * 100}%`,
              }}
            />
          )}

          {/* AI Mockup Overlay */}
          {activeMockupUrl && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 z-[60] animate-in fade-in zoom-in-95 duration-300">
              <div className="relative max-h-full max-w-full">
                <img
                  src={activeMockupUrl}
                  className="max-h-[80vh] w-auto rounded-lg shadow-2xl border border-white/10"
                  alt="AI Mockup"
                />
                <button
                  onClick={() => sendData("MOCKUP_READY", { url: null })}
                  className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => window.open(activeMockupUrl)}
                  className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition"
                >
                  <Maximize2 className="w-4 h-4" /> Open Full Resolution
                </button>
              </div>
            </div>
          )}

          {/* PIP: Local Video */}
          <div className="absolute bottom-4 left-4 w-32 h-44 rounded-xl overflow-hidden border border-white/20 shadow-2xl z-30 bg-black/50 backdrop-blur-sm transition-transform hover:scale-105">
            {localTrack ? (
              <VideoTrack
                trackRef={localTrack}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                <Video size={20} />
              </div>
            )}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-2">
              <p className="text-[9px] font-black uppercase text-white tracking-wider pl-1">
                You
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* --- RIGHT: TOOLBAR SIDEBAR --- */}
      <div className="w-full lg:w-48 border-t lg:border-t-0 border-white/10 flex lg:flex-col items-center lg:items-stretch gap-2 p-2 lg:p-2 mt-0 md:mt-3 z-40 shrink-0">
        {/* 2x2 Grid on Desktop, horizontal flex on mobile */}
        <div className="text-xs font-semibold text-white/60 mb- hidden md:flex">
          TOOLS{" "}
        </div>
        <div className="flex lg:grid lg:grid-cols-2 gap-2 w-full">
          {/* <ToolButton
            icon={Sparkles}
            label={isGenerating ? "Gen..." : "Generate"}
            variant="primary"
            isDisabled={isGenerating || !remoteTrack}
            onClick={() => triggerAI(slug)}
          /> */}

          <ToolButton
            icon={copied ? Check : Share2}
            label={copied ? "Copied" : "Invite"}
            onClick={copyInvite}
            colorClass={copied ? "text-green-400" : "text-blue-400"}
          />

          <ToolButton
            icon={Camera}
            label="Snapshot"
            onClick={() => console.log("Snapshot clicked")}
          />

          <ToolButton
            icon={isTranscribing ? Mic : MicOff}
            label={isTranscribing ? "Listening" : "Record"}
            isActive={isTranscribing}
            onClick={toggleTranscription}
            colorClass={isTranscribing ? "text-red-400" : "text-zinc-400"}
          />

          <ToolButton
            icon={Settings}
            label="Settings"
            onClick={() => console.log("Settings clicked")}
          />
        </div>

        {/* Other section - only shows on desktop, takes remaining space */}
        <div className="hidden lg:flex lg:flex-col lg:flex-1 gap-2 overflow-y-auto">
          <div className="text-xs font-semibold text-white/60 mb-1">INTEL</div>
          {MOCK_SCOPE_ITEMS &&
            MOCK_SCOPE_ITEMS.length > 0 &&
            MOCK_SCOPE_ITEMS.map((item) => (
              <div key={item.id} className="bg-muted/50 rounded-md p-2 text-xs">
                <div className="text-primary font-mono font-bold text-[10px] mb-1 flex gap-2 items-center">
                  <DatabaseZap className="size-3 text-primary" />{" "}
                  {item.category}
                </div>
                <div className="text-black font-medium">{item.item}</div>
                <div className="text-muted-foreground font-semibold">
                  {item.action}
                </div>
                <div className="text-black/30 text-[10px] mt-1">
                  {item.timestamp}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
