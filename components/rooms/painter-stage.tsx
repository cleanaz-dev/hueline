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
  Wrench,
  Info,
  Layers,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import ScopeList from "./room-scope-list";

// --- TYPES ---
interface BookingDataProps {
  name: string;
  phone: string;
  summary: string;
  roomType: string;
  initialIntent: string;
  estimatedValue?: number | null;
  dateTime: Date | string;
}

interface LiveStageProps {
  slug: string;
  roomId: string;
  booking?: BookingDataProps | null;
}

// --- TAB COMPONENT ---
const SidebarTab = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2",
      active 
        ? "border-cyan-500 text-cyan-400 bg-cyan-950/10" 
        : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
    )}
  >
    <Icon size={14} />
    {label}
  </button>
);

// --- MAIN COMPONENT ---
export const PainterStage = ({ slug, roomId, booking }: LiveStageProps) => {
  const {
    laserPosition,
    sendData,
    isPainter,
    activeMockupUrl,
    room,
    isTranscribing,
    toggleTranscription,
  } = useRoomContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState<"controls" | "info">("controls");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // --- PREVENT SCROLLING / PULL-TO-REFRESH ---
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // --- TRACKS & DEVICES ---
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind: 'videoinput' });
  
  const handleSwitchCamera = async () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === activeDeviceId);
    const nextDevice = devices[(currentIndex + 1) % devices.length];
    if (nextDevice) await setActiveMediaDevice(nextDevice.deviceId);
  };

  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const localTrack = tracks.find((t) => t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;
  const remoteTrack = tracks.find((t) => !t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;
  
  const mainFeed = isSwapped ? localTrack : remoteTrack;
  const pipFeed = isSwapped ? remoteTrack : localTrack;

  // --- ACTIONS ---
  const copyInvite = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}/meet/${roomId}?role=client`);
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

  // --- COMPONENTS ---
  const ToolButton = ({ icon: Icon, label, isActive, onClick, colorClass }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 group w-full",
        "bg-zinc-900/50 border-white/5 hover:bg-zinc-800 hover:border-white/10",
        isActive && "bg-cyan-950/40 border-cyan-500/30"
      )}
    >
      <Icon 
        size={20} 
        className={cn("mb-2 transition-colors", isActive ? "text-cyan-400" : (colorClass || "text-zinc-400"))} 
      />
      <span className={cn("text-[9px] font-bold uppercase tracking-wider", isActive ? "text-cyan-500" : "text-zinc-500")}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden font-sans">
      <RoomAudioRenderer />

      {/* =========================================
          LEFT STAGE (VIDEO CENTER) 
      ========================================= */}
      <div className="flex-1 relative flex flex-col min-w-0">
        
        {/* Top Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
           <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full pointer-events-auto">
              <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]", room?.state === "connected" ? "bg-green-500 text-green-500" : "bg-yellow-500 text-yellow-500")} />
              <span className="text-xs font-bold text-zinc-200 tracking-wide uppercase">
                {room?.name || roomId}
              </span>
           </div>
        </div>

        {/* Video Stage: 
            This uses flexbox centering to ensure the video naturally finds its aspect ratio 
            without being forced to stretch weirdly.
        */}
        <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
          <div 
            ref={containerRef}
            onClick={handlePointer}
            // Aspect Ratio Wrapper: This ensures the clickable area matches the video visuals roughly
            // but max-w/max-h ensures it fits on screen.
            className="relative w-full h-full max-w-full max-h-full flex items-center justify-center cursor-crosshair"
          >
            {mainFeed ? (
              <VideoTrack 
                trackRef={mainFeed} 
                // CRITICAL: objectFit: 'contain' keeps aspect ratio correct inside the available space
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                className="max-w-full max-h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-600 gap-4">
                 <div className="w-12 h-12 border-2 border-t-cyan-500 border-zinc-800 rounded-full animate-spin" />
                 <span className="text-xs font-bold uppercase tracking-widest">Waiting for Feed</span>
              </div>
            )}

            {/* Pointer Overlay */}
            {laserPosition && !isSwapped && (
              <div className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-cyan-400 bg-cyan-400/20 rounded-full animate-ping z-50 pointer-events-none" style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }} />
            )}

            {/* Active Mockup Overlay */}
            {activeMockupUrl && (
              <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
                <img src={activeMockupUrl} className="max-w-full max-h-full object-contain shadow-2xl rounded-sm" alt="Mockup" />
                <button onClick={() => sendData("MOCKUP_READY", { url: null })} className="absolute top-6 right-6 bg-white/10 hover:bg-red-600 text-white p-2 rounded-full transition-colors"><X size={20}/></button>
              </div>
            )}
          </div>

          {/* PIP (Picture in Picture) */}
          <div className="absolute bottom-6 left-6 z-30 w-32 aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden border border-white/10 shadow-2xl group">
             {pipFeed ? (
               <VideoTrack trackRef={pipFeed} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center"><Video size={20} className="text-zinc-700"/></div>
             )}
             <button 
                onClick={(e) => { e.stopPropagation(); setIsSwapped(!isSwapped); }} 
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-cyan-600 text-white rounded-md backdrop-blur-sm transition-colors"
             >
                <ArrowRightLeft size={12} />
             </button>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT SIDEBAR (DESKTOP)
      ========================================= */}
      <div className="hidden lg:flex flex-col w-96 bg-zinc-950 border-l border-white/5 shrink-0 z-30">
        
        {/* Sidebar Tabs */}
        <div className="flex items-center border-b border-white/5 bg-zinc-900/50">
           <SidebarTab 
             active={activeTab === 'controls'} 
             onClick={() => setActiveTab('controls')} 
             icon={Layers} 
             label="Controls" 
           />
           <SidebarTab 
             active={activeTab === 'info'} 
             onClick={() => setActiveTab('info')} 
             icon={Info} 
             label="Job Info" 
           />
        </div>

        {/* CONTENT: CONTROLS */}
        {activeTab === 'controls' && (
          <div className="flex-1 flex flex-col min-h-0">
             {/* Tools Grid */}
             <div className="p-4 border-b border-white/5">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Tools</div>
                <div className="grid grid-cols-2 gap-2">
                    <ToolButton icon={copied ? Check : Share2} label={copied ? "Copied" : "Invite"} onClick={copyInvite} colorClass="text-blue-400" />
                    <ToolButton icon={Camera} label="Snapshot" onClick={() => console.log('snap')} />
                    <ToolButton icon={isTranscribing ? Mic : MicOff} label={isTranscribing ? "Listening" : "Transcribe"} isActive={isTranscribing} onClick={toggleTranscription} colorClass="text-red-400" />
                    {devices.length > 1 && <ToolButton icon={SwitchCamera} label="Flip Cam" onClick={handleSwitchCamera} colorClass="text-purple-400" />}
                </div>
             </div>
             
             {/* Scope List */}
             <div className="flex-1 flex flex-col min-h-0 p-4 bg-zinc-900/30">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Scope Items</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-1">
                   <ScopeList roomId={roomId} slug={slug} />
                </div>
             </div>
          </div>
        )}

        {/* CONTENT: INFO */}
        {activeTab === 'info' && booking && (
           <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Client</label>
                    <div className="text-lg font-medium text-white">{booking.name}</div>
                    <div className="text-sm text-zinc-400">{booking.phone}</div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded bg-zinc-900 border border-white/5">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Type</label>
                       <div className="text-sm font-medium text-white">{booking.roomType}</div>
                    </div>
                    <div className="p-3 rounded bg-zinc-900 border border-white/5">
                       <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Value</label>
                       <div className="text-sm font-medium text-green-400">${booking.estimatedValue?.toLocaleString() || '0'}</div>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Summary</label>
                    <div className="p-4 rounded-lg bg-zinc-900 border border-white/5 text-xs text-zinc-300 leading-relaxed">
                       {booking.summary || "No summary available."}
                    </div>
                 </div>
              </div>
           </div>
        )}
        {!booking && activeTab === 'info' && (
           <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs uppercase tracking-widest">No Booking Data</div>
        )}
      </div>

      {/* =========================================
          MOBILE OVERLAY (DRAWER)
      ========================================= */}
      <div className={cn(
        "lg:hidden fixed inset-x-0 bottom-0 z-50 bg-zinc-950 border-t border-white/10 transition-transform duration-300 flex flex-col shadow-2xl",
        showMobileMenu ? "translate-y-0 h-[60vh]" : "translate-y-[calc(100%-80px)] h-auto"
      )}>
         {/* Handle / Header */}
         <div onClick={() => setShowMobileMenu(!showMobileMenu)} className="flex items-center justify-between p-4 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 cursor-pointer">
             <div className="flex items-center gap-2">
                <LayoutGrid size={16} className="text-cyan-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Menu</span>
             </div>
             {showMobileMenu ? <ChevronDown size={18} className="text-zinc-400"/> : <div className="w-10 h-1 bg-zinc-700 rounded-full" />}
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-zinc-950">
             {/* Mobile Tools */}
             <div className="grid grid-cols-4 gap-2">
                <ToolButton icon={isTranscribing ? Mic : MicOff} label={isTranscribing ? "On" : "Rec"} isActive={isTranscribing} onClick={toggleTranscription} colorClass="text-red-400" />
                {devices.length > 1 && <ToolButton icon={SwitchCamera} label="Flip" onClick={handleSwitchCamera} colorClass="text-purple-400" />}
                <ToolButton icon={Camera} label="Snap" onClick={() => console.log('snap')} />
                <ToolButton icon={Share2} label="Share" onClick={copyInvite} colorClass="text-blue-400" />
             </div>

             {/* Mobile Scope */}
             <div className="border-t border-white/5 pt-4">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-3">Scope Items</span>
               <div className="h-40 overflow-y-auto">
                 <ScopeList roomId={roomId} slug={slug} />
               </div>
             </div>
         </div>
      </div>

    </div>
  );
};