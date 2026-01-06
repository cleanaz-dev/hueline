"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRoomContext } from "@/context/room-context";
import {
  useTracks,
  RoomAudioRenderer,
  isTrackReference,
  type TrackReference,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { PhoneOff, Video, X, ListTodo, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import ScopeList from "../room-scope-list";
import { useCameraEvents } from "@/hooks/use-camera-events";

interface ClientStageProps {
  slug: string;
  roomId: string;
}

export const ClientSelfServeStage = ({ slug, roomId }: ClientStageProps) => {
  const {
    laserPosition,
    activeMockupUrl,
    sendData,
    room,
  } = useRoomContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileScope, setShowMobileScope] = useState(false);
  const { countdown, isCapturing } = useCameraEvents(slug, roomId);

  // Prevent scrolling
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);

  const remoteTrack = tracks.find(
    (t) => !t.participant.isLocal && isTrackReference(t)
  ) as TrackReference | undefined;

  const handleEndRoom = async () => {
    if (room) {
      await room.disconnect();
      window.location.href = `/`;
    }
  };

  return (
    <div className="flex h-dvh w-full bg-black overflow-hidden font-sans text-gray-900 relative">
      <RoomAudioRenderer />

      {/* FULLSCREEN VIDEO */}
      <div className="flex-1 relative flex flex-col min-w-0 h-full">
        {/* Header Status */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 bg-zinc-600/50 backdrop-blur-md border border-zinc-700 shadow-sm px-4 py-2 rounded-full pointer-events-auto">
            <div
              className={cn(
                "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                room?.state === "connected"
                  ? "bg-green-500 text-green-500"
                  : "bg-yellow-500 text-yellow-500"
              )}
            />
            <span className="text-xs font-bold text-white tracking-wide uppercase">
              Live Session
            </span>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex items-center justify-center p-0 overflow-hidden bg-black">
          <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center overflow-hidden">
            <div
              ref={containerRef}
              className="w-full h-full flex items-center justify-center relative"
            >
              {remoteTrack ? (
                <VideoTrack
                  trackRef={remoteTrack}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  className="max-w-full max-h-full bg-black"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 gap-4">
                  <div className="w-12 h-12 border-2 border-t-blue-500 border-gray-800 rounded-full animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Waiting for Painter
                  </span>
                </div>
              )}

              {/* CAMERA COUNTDOWN OVERLAY */}
              {isCapturing && countdown !== null && (
                <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-8 border-white/20 flex items-center justify-center">
                        <span className="text-8xl font-bold text-white animate-pulse">
                          {countdown > 0 ? countdown : '📸'}
                        </span>
                      </div>
                      {countdown > 0 && (
                        <div className="absolute inset-0 rounded-full border-8 border-blue-500 animate-ping" />
                      )}
                    </div>
                    <p className="text-white text-xl font-bold uppercase tracking-wider">
                      {countdown > 0 ? 'Get Ready!' : 'Smile!'}
                    </p>
                  </div>
                </div>
              )}

              {/* Laser Pointer */}
              {laserPosition && (
                <div
                  className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-red-500 bg-red-500/20 rounded-full animate-ping z-50 pointer-events-none shadow-lg"
                  style={{
                    left: `${laserPosition.x * 100}%`,
                    top: `${laserPosition.y * 100}%`,
                  }}
                />
              )}

              {/* Mockup Overlay */}
              {activeMockupUrl && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
                  <img
                    src={activeMockupUrl}
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                    alt="Mockup"
                  />
                  <button
                    onClick={() => sendData("MOCKUP_READY", { url: null })}
                    className="absolute top-6 right-6 bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE FAB & MENU */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={cn(
            "absolute right-6 bottom-6 z-50 text-white bg-blue-600/75 p-1.5 rounded-full shadow-lg shadow-blue-600/30 border border-white/20 transition-all duration-200 active:scale-95",
            showMobileMenu ? "rotate-90 bg-gray-800 text-white" : ""
          )}
        >
          {showMobileMenu ? <X size={24} /> : <MoreVertical size={24} />}
        </button>

        <div
          className={cn(
            "absolute right-6 bottom-24 z-40 flex flex-col gap-3 transition-all duration-300 origin-bottom",
            showMobileMenu
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-8 pointer-events-none"
          )}
        >
          <button
            onClick={() => {
              setShowMobileScope(true);
              setShowMobileMenu(false);
            }}
            className="w-12 h-12 rounded-full border bg-white border-gray-200 shadow-md flex items-center justify-center transition-all duration-200 active:scale-95"
          >
            <ListTodo size={20} className="text-orange-500" />
          </button>
          <button
            onClick={() => setShowEndDialog(true)}
            className="w-12 h-12 rounded-full border bg-red-50 border-red-100 text-red-600 shadow-md flex items-center justify-center transition-all duration-200 active:scale-95"
          >
            <PhoneOff size={20} />
          </button>
        </div>

        {/* MOBILE SCOPE MODAL */}
        {showMobileScope && (
          <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end">
            <div className="w-full bg-white rounded-t-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                  <ListTodo size={18} className="text-orange-500" /> Active Scope
                </span>
                <button
                  onClick={() => setShowMobileScope(false)}
                  className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto min-h-[300px]">
                <ScopeList roomId={roomId} slug={slug} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* END DIALOG MODAL */}
      {showEndDialog && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <PhoneOff size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Leave Session?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                You will be disconnected from the live session.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowEndDialog(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndRoom}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};