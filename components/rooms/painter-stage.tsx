"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRoomContext } from "@/context/room-context";
import {
  VideoTrack,
  useTracks,
  RoomAudioRenderer,
  isTrackReference,
  type TrackReference,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  Maximize2,
  Camera,
  Settings,
  Mic,
  MicOff,
  Video,
  X,
  Check,
  Share2,
  SwitchCamera,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ScopeList from "./room-scope-list";

interface LiveStageProps {
  slug: string;
  roomId: string;
}

export const PainterStage = ({ slug, roomId }: LiveStageProps) => {
  const {
    laserPosition,
    sendData,
    isPainter,
    activeMockupUrl,
    room,
    liveScopeItems,
    isTranscribing,
    toggleTranscription,
  } = useRoomContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  
  // Mobile Tool Visibility State
  const [showTools, setShowTools] = useState(true);

  // --- SIMPLE PULL-TO-REFRESH PREVENTION ---
  useEffect(() => {
    const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const originalBodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";

    const preventPullToRefresh = (e: TouchEvent) => {
      if (window.scrollY === 0 && e.touches[0].clientY > e.touches[0].pageY) {
        e.preventDefault();
      }
    };

    document.body.addEventListener('touchmove', preventPullToRefresh, { passive: false });

    return () => {
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
      document.body.style.overscrollBehavior = originalBodyOverscroll;
      document.body.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

  // --- CAMERA SWITCHING LOGIC ---
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    kind: 'videoinput',
  });

  const handleSwitchCamera = async () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    if (nextDevice) {
      await setActiveMediaDevice(nextDevice.deviceId);
    }
  };

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

  const mainFeed = isSwapped ? localTrack : remoteTrack;
  const pipFeed = isSwapped ? remoteTrack : localTrack;

  const copyInvite = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/meet/${roomId}?role=client`;

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

  const ToolButton = ({
    icon: Icon,
    label,
    isActive = false,
    isDisabled = false,
    onClick,
    variant = "default",
    colorClass,
  }: any) => (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-full p-2 rounded-xl transition-all duration-200 group relative",
        // Mobile / Desktop specific styling
        "bg-white/10 backdrop-blur-md lg:bg-muted", 
        isDisabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:bg-white/20 lg:hover:bg-zinc-100/80",
        !isActive &&
          variant !== "primary" &&
          (colorClass || "text-white lg:text-muted-foreground"),
        isActive && "bg-cyan-500/20 text-cyan-300 lg:bg-cyan-50 lg:text-primary",
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg transition-all duration-200 group-hover:scale-105",
          isActive ? "bg-cyan-500/20 lg:bg-white lg:border-cyan-200" : "lg:bg-white lg:border lg:shadow-sm"
        )}
      >
        <Icon
          size={20}
          strokeWidth={2}
        />
      </div>
      <span
        className={cn(
          "text-[9px] font-bold uppercase tracking-wider mt-1 lg:block hidden", // Hidden label on mobile to save space
          "opacity-90"
        )}
      >
        {label}
      </span>
    </button>
  );

  return (
    // MAIN CONTAINER: Changed to flex-row for desktop, but relative/block for mobile to allow overlay
    <div className="relative lg:flex lg:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-9rem)] lg:h-[calc(100vh-8rem)] w-full overflow-hidden lg:gap-4 bg-black">
      <RoomAudioRenderer />

      {/* --- VIDEO AREA (Full Screen on Mobile) --- */}
      <div className="absolute inset-0 lg:relative lg:flex-1 lg:h-full z-0 flex flex-col overflow-hidden">
        
        {/* Status Bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-3 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-xl">
            <div
              className={cn(
                "w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]",
                room?.state === "connected"
                  ? "bg-green-500 text-green-500 animate-pulse"
                  : "bg-yellow-500 text-yellow-500"
              )}
            />
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              {room?.name || roomId || "Init..."}
            </span>
          </div>
        </div>

        {/* Video Wrapper */}
        <div
          ref={containerRef}
          onClick={handlePointer}
          className="relative w-full h-full bg-zinc-950 lg:rounded-2xl overflow-hidden border-0 lg:border border-white/10 shadow-md cursor-crosshair group"
        >
          {mainFeed ? (
            <VideoTrack
              trackRef={mainFeed}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              className="pointer-events-none"
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
                  {isSwapped ? "Local Cam" : "Waiting..."}
                </p>
              </div>
            </div>
          )}

          {/* Overlays */}
          {laserPosition && !isSwapped && (
            <div
              className="absolute w-12 h-12 -ml-6 -mt-6 border-4 border-cyan-400 rounded-full animate-ping z-50 pointer-events-none shadow-[0_0_30px_rgba(34,211,238,0.8)]"
              style={{
                left: `${laserPosition.x * 100}%`,
                top: `${laserPosition.y * 100}%`,
              }}
            />
          )}

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
                  <Maximize2 className="w-4 h-4" /> Open Full
                </button>
              </div>
            </div>
          )}

          {/* PIP (Secondary Feed) - Positioned higher on mobile to avoid tool overlay */}
          <div className={cn(
            "absolute left-4 w-28 h-36 lg:w-32 lg:h-44 rounded-xl overflow-hidden border border-white/20 shadow-2xl z-30 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
            showTools ? "bottom-32 lg:bottom-4" : "bottom-4" // Moves up when tools are shown on mobile
          )}>
            {pipFeed ? (
              <VideoTrack
                trackRef={pipFeed}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                <Video size={20} />
              </div>
            )}
            
            {/* SWAP BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSwapped(!isSwapped);
              }}
              className="absolute top-2 right-2 bg-white/10 hover:bg-cyan-500 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg z-50 cursor-pointer border border-white/20"
              title="Swap View"
            >
              <ArrowRightLeft size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* --- TOGGLE BUTTON (Mobile Only) --- */}
      <button 
        onClick={() => setShowTools(!showTools)}
        className="lg:hidden absolute bottom-4 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/20 text-white p-3 rounded-full shadow-lg"
      >
        {showTools ? <ChevronDown size={20} /> : <Wrench size={20} />}
      </button>

      {/* --- TOOLS SIDEBAR / OVERLAY --- */}
      <div className={cn(
        "absolute lg:static z-40 w-full lg:w-48 bg-black/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-t border-white/10 lg:border-0 transition-transform duration-300 ease-in-out flex flex-col gap-2 p-4 lg:p-2",
        // Position logic
        "bottom-0 left-0",
        // Hide/Show logic for mobile
        showTools ? "translate-y-0" : "translate-y-[110%] lg:translate-y-0"
      )}>
        
        <div className="text-xs font-semibold text-white/50 lg:text-muted-foreground mb-1 hidden md:flex">
          TOOLS
        </div>

        <div className="grid grid-cols-5 lg:grid-cols-2 gap-2 w-full">
          {devices.length > 1 && (
             <ToolButton
              icon={SwitchCamera}
              label="Flip"
              onClick={handleSwitchCamera}
              colorClass="text-purple-400"
            />
          )}

          <ToolButton
            icon={copied ? Check : Share2}
            label={copied ? "Copied" : "Invite"}
            onClick={copyInvite}
            colorClass={copied ? "text-green-400" : "text-blue-400"}
          />

          <ToolButton
            icon={Camera}
            label="Snap"
            onClick={() => console.log("Snapshot clicked")}
          />

          <ToolButton
            icon={isTranscribing ? Mic : MicOff}
            label={isTranscribing ? "On" : "Rec"}
            isActive={isTranscribing}
            onClick={toggleTranscription}
            colorClass={isTranscribing ? "text-red-400" : "text-zinc-400"}
          />

          <ToolButton
            icon={Settings}
            label="Set"
            onClick={() => console.log("Settings clicked")}
          />
        </div>

        {/* Divider for mobile */}
        <div className="h-px w-full bg-white/10 lg:hidden my-1" />

        {/* Scope List Container - scrollable on mobile */}
        <div className="flex-1 overflow-y-auto max-h-[150px] lg:max-h-full">
           <ScopeList roomId={roomId} slug={slug} />
        </div>
      </div>
    </div>
  );
};