"use client";

import React, { useEffect, useState } from "react";
import { RoomAudioRenderer, VideoTrack } from "@livekit/components-react";
import {
  PhoneOff,
  X,
  ListTodo,
  MoreVertical,
  SwitchCamera,
  Scan,
  Loader2,
  CheckCircle2,
  ScanFace,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SelfServeScopeList from "./self-serve-room-list";
import { useSelfServe } from "@/hooks/use-self-serve";
import Image from "next/image";
import { AgentOrb } from "./ai-agent-orb";
import { useAgentListener } from "@/hooks/use-agent-listener";

// --- FLASH COMPONENT ---
const FlashNotification = ({
  storageKey,
  area,
  onDismiss,
  onExpand,
}: {
  storageKey: string;
  area: string;
  onDismiss: () => void;
  onExpand: (url: string) => void;
}) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await fetch(
          `/api/storage/sign?key=${encodeURIComponent(storageKey)}`
        );
        const data = await res.json();
        if (data.url) setUrl(data.url);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUrl();

    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [storageKey, onDismiss]);

  if (!url) return null;

  return (
    <div
      onClick={() => onExpand(url)}
      className="absolute top-20 right-4 z-50 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl shadow-2xl animate-in slide-in-from-right duration-500 cursor-pointer hover:bg-white/20 transition-colors flex gap-3 items-center"
    >
      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black">
        <Image src={url} alt="Capture" fill className="object-cover" />
      </div>
      <div className="pr-2">
        <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 size={10} /> Captured
        </p>
        <p className="text-xs text-white font-medium capitalize">{area}</p>
      </div>
    </div>
  );
};

export const ClientSelfServeStage = ({
  slug,
  roomId,
}: {
  slug: string;
  roomId: string;
}) => {
  const {
    room,
    localTrack,
    containerRef,
    laserPosition,
    activeMockupUrl,
    countdown,
    isCapturing,
    hasMultipleCameras,
    data,
    uiState,
    setUiState,
    actions,
  } = useSelfServe(slug, roomId);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const { agentParticipant, agentAudioTrack, isAgentConnected } =
    useAgentListener();

  return (
    <div
      className="flex-1 relative flex flex-col min-w-0 bg-black text-white font-sans"
      style={{
        height: "100dvh",
        width: "100dvw",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overscrollBehavior: "none",
      }}
    >
      <RoomAudioRenderer />

      {/* --- FLASH NOTIFICATION --- */}
      {data.lastCapture && (
        <FlashNotification
          key={data.lastCapture.path}
          storageKey={data.lastCapture.path}
          area={data.lastCapture.area}
          onDismiss={() => setUiState.setLastCapture(null)}
          onExpand={(url) => setLightboxUrl(url)}
        />
      )}

      {/* --- LIGHTBOX --- */}
      {lightboxUrl && (
        <div
          className="absolute inset-0 z-[70] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={lightboxUrl}
              alt="Review"
              fill
              className="object-contain"
            />
            <button className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white">
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
        {/* Status Pill */}
        <div className="flex items-center gap-3 bg-zinc-600/50 backdrop-blur-md border border-zinc-700 shadow-sm px-4 py-2 rounded-full pointer-events-auto">
          <div
            className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
              room?.state === "connected"
                ? "bg-red-500 text-red-500 animate-pulse"
                : "bg-yellow-500 text-yellow-500"
            )}
          />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            {room?.state === "connected" ? "Live Survey" : "Connecting..."}
          </span>
        </div>

        {/* --- RIGHT: AI AGENT ORB --- */}
        {/* We wrap it in pointer-events-auto so if you want to add click-to-mute later, you can */}
        <div className="absolute top-4 right-4 pointer-events-auto transition-all duration-500 animate-in fade-in slide-in-from-top-4 z-30">
          {isAgentConnected ? (
            <AgentOrb
              participant={agentParticipant}
              trackPublication={agentAudioTrack}
            />
          ) : null}
        </div>
      </div>

      {/* --- SWITCH CAMERA (Bottom Left) --- */}
      {hasMultipleCameras && (
        <button
          onClick={actions.handleSwitchCamera}
          className="absolute left-6 bottom-6 z-50 w-12 h-12 rounded-full bg-zinc-800/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 hover:bg-zinc-700/80"
        >
          <SwitchCamera size={24} />
        </button>
      )}

      {/* --- MENU BUTTON (Bottom Right) --- */}
      <button
        onClick={() => setUiState.setShowMobileMenu(!uiState.showMobileMenu)}
        className={cn(
          "absolute right-6 bottom-6 z-50 text-white bg-blue-600/75 p-1.5 rounded-full shadow-lg shadow-blue-600/30 border border-white/20 transition-all duration-200 active:scale-95",
          uiState.showMobileMenu ? "rotate-90 bg-gray-800 text-white" : ""
        )}
      >
        {uiState.showMobileMenu ? <X size={24} /> : <MoreVertical size={24} />}
      </button>

      {/* --- MENU OPTIONS (Bottom Right Stack) --- */}
      <div
        className={cn(
          "absolute right-6 bottom-24 z-40 flex flex-col gap-3 transition-all duration-300 origin-bottom",
          uiState.showMobileMenu
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-8 pointer-events-none"
        )}
      >
        <button
          onClick={() => {
            setUiState.setShowMobileScope(true);
            setUiState.setShowMobileMenu(false);
          }}
          className="w-12 h-12 rounded-full border bg-white border-gray-200 shadow-md flex items-center justify-center transition-all duration-200 active:scale-95 text-orange-500"
        >
          <ListTodo size={20} />
        </button>

        {/* Note: Switch Camera removed from here, moved to main stage */}

        <button
          onClick={() => setUiState.setShowEndDialog(true)}
          className="w-12 h-12 rounded-full border bg-red-50 border-red-100 text-red-600 shadow-md flex items-center justify-center transition-all duration-200 active:scale-95"
        >
          <PhoneOff size={20} />
        </button>
      </div>

      {/* --- MAIN STAGE --- */}
      <div className="flex-1 flex items-center justify-center p-0 overflow-hidden bg-black">
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center relative"
        >
          {localTrack ? (
            <VideoTrack
              trackRef={localTrack}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              className="max-w-full max-h-full bg-black"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Starting Camera...
              </span>
            </div>
          )}

          {/* OVERLAYS (Countdown) */}
          {isCapturing && countdown !== null && (
            <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-white/20 flex items-center justify-center">
                    <span className="text-8xl font-bold text-white animate-pulse">
                      {countdown > 0 ? countdown : <ScanFace className="size-16" />}
                    </span>
                  </div>
                  {countdown > 0 && (
                    <div className="absolute inset-0 rounded-full border-8 border-blue-500 animate-ping" />
                  )}
                </div>
                <p className="text-white text-xl font-bold uppercase tracking-wider">
                  {countdown > 0 ? "Hold Steady" : "Capturing!"}
                </p>
              </div>
            </div>
          )}

          {/* MOCKUP & LASER */}
          {laserPosition && (
            <div
              className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-red-500 bg-red-500/20 rounded-full animate-ping z-50 pointer-events-none shadow-lg"
              style={{
                left: `${laserPosition.x * 100}%`,
                top: `${laserPosition.y * 100}%`,
              }}
            />
          )}
          {activeMockupUrl && (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
              <img
                src={activeMockupUrl}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                alt="Mockup"
              />
              <button
                onClick={actions.dismissMockup}
                className="absolute top-6 right-6 bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- SCOPE MODAL --- */}
      {uiState.showMobileScope && (
        <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end">
          <div className="w-full bg-white rounded-t-2xl max-h-[85dvh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <ListTodo size={18} className="text-orange-500" /> Active Scope
              </span>
              <button
                onClick={() => setUiState.setShowMobileScope(false)}
                className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto min-h-[300px] pb-24 overscroll-contain">
              <SelfServeScopeList
                scopes={data.scopes}
                isConnected={data.isStreamConnected}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- END DIALOG --- */}
      {uiState.showEndDialog && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <PhoneOff size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Finish Survey?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you done capturing details?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setUiState.setShowEndDialog(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={actions.handleEndRoom}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                Complete <CheckCircle2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
