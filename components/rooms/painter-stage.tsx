"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRoomContext } from "@/context/room-context";
import {
  useTracks,
  RoomAudioRenderer,
  isTrackReference,
  type TrackReference,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { PainterStageDesktop } from "./painter-stage-desktop";
import { PainterStageMobile } from "./painter-stage-mobile";
import { PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

// --- TYPES ---
export interface BookingDataProps {
  name: string;
  phone: string;
  summary: string;
  roomType: string;
  initialIntent: string;
  estimatedValue?: number | null;
  dateTime: Date | string;
}

export interface PainterUIProps {
  slug: string;
  roomId: string;
  booking?: BookingDataProps | null;
  // State
  mainFeed?: TrackReference;
  pipFeed?: TrackReference;
  isSwapped: boolean;
  setIsSwapped: (v: boolean) => void;
  isTranscribing: boolean;
  roomState?: string;
  activeMockupUrl?: string | null;
  laserPosition: { x: number; y: number } | null;
  deviceCount: number;
  copied: boolean;
  // Handlers
  onSwitchCamera: () => void;
  onCopyInvite: () => void;
  onToggleTranscription: () => void;
  onPointer: (e: React.MouseEvent) => void;
  onCloseMockup: () => void;
  setShowEndDialog: (v: boolean) => void;
  // --- FIX BELOW ---
  containerRef: React.RefObject<HTMLDivElement | null>; 
}
interface LiveStageProps {
  slug: string;
  roomId: string;
  booking?: BookingDataProps | null;
}

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
  const [showEndDialog, setShowEndDialog] = useState(false);

  // --- PREVENT SCROLLING ---
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // --- TRACKS & DEVICES ---
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    kind: "videoinput",
  });

  const handleSwitchCamera = async () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === activeDeviceId);
    const nextDevice = devices[(currentIndex + 1) % devices.length];
    if (nextDevice) await setActiveMediaDevice(nextDevice.deviceId);
  };

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

  const handleEndRoom = async () => {
    if (room) {
      await room.disconnect();
      window.location.href = `/my/dashboard`;
    }
  };

  const uiProps: PainterUIProps = {
    slug,
    roomId,
    booking,
    mainFeed,
    pipFeed,
    isSwapped,
    setIsSwapped,
    isTranscribing,
    roomState: room?.state,
    activeMockupUrl,
    laserPosition,
    deviceCount: devices.length,
    copied,
    onSwitchCamera: handleSwitchCamera,
    onCopyInvite: copyInvite,
    onToggleTranscription: toggleTranscription,
    onPointer: handlePointer,
    onCloseMockup: () => sendData("MOCKUP_READY", { url: null }),
    setShowEndDialog,
    containerRef,
  };

  return (
    <div className="flex h-dvh w-full bg-gray-50 overflow-hidden font-sans text-gray-900 relative">
      <RoomAudioRenderer />

      {/* Render Desktop View */}
      <div className="hidden lg:flex w-full h-full">
        <PainterStageDesktop {...uiProps} />
      </div>

      {/* Render Mobile View */}
      <div className="lg:hidden w-full h-full">
        <PainterStageMobile {...uiProps} />
      </div>

      {/* Shared End Dialog Modal */}
      {showEndDialog && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <PhoneOff size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                End Session?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                This will disconnect you from the room. The client will be
                notified.
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
                  End Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};