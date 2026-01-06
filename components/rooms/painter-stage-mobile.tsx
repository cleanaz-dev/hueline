import React, { useState } from "react";
import { VideoTrack } from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Video,
  X,
  Share2,
  SwitchCamera,
  ArrowRightLeft,
  MoreVertical,
  ListTodo,
  PhoneOff,
  Scan,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ScopeList from "./room-scope-list";
import { PainterUIProps } from "./painter-stage";
import { useCameraEvents } from "@/hooks/use-camera-events";

// Local Mobile Tool Button
const MobileToolButton = ({
  icon: Icon,
  isActive,
  onClick,
  colorClass,
  variant = "default",
}: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-12 h-12 rounded-full border active:scale-95 shadow-md flex items-center justify-center transition-all duration-200 group",
      variant === "destructive"
        ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
        : "bg-white border-gray-200 hover:bg-gray-50",
      isActive && "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
    )}
  >
    <Icon
      size={20}
      className={cn(
        "transition-colors",
        isActive
          ? "text-blue-600"
          : colorClass ||
              (variant === "destructive"
                ? "text-red-600"
                : "text-gray-500 group-hover:text-gray-700")
      )}
    />
  </button>
);

export const PainterStageMobile = (props: PainterUIProps) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileScope, setShowMobileScope] = useState(false);
  const { countdown, isCapturing } = useCameraEvents(props.slug, props.roomId);

  return (
    <div className="flex-1 relative flex flex-col min-w-0 h-full">
      {/* VIDEO STAGE (FULLSCREEN MOBILE) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 bg-zinc-600/50 backdrop-blur-md border border-zinc-700 shadow-sm px-4 py-2 rounded-full pointer-events-auto">
          <div
            className={cn(
              "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
              props.roomState === "connected"
                ? "bg-green-500 text-green-500"
                : "bg-yellow-500 text-yellow-500"
            )}
          />
          <span className="text-xs font-bold text-muted tracking-wide uppercase">
            {props.roomId}
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-0 overflow-hidden bg-black">
        <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center overflow-hidden">
          <div
            ref={props.containerRef}
            onClick={props.onPointer}
            className="w-full h-full flex items-center justify-center cursor-crosshair relative"
          >
            {props.mainFeed ? (
              <VideoTrack
                trackRef={props.mainFeed}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                className="max-w-full max-h-full bg-black"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-12 h-12 border-2 border-t-blue-500 border-gray-800 rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Waiting for Feed
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
                        {countdown > 0 ? countdown : <Scan className="size-4"/>}
                      </span>
                    </div>
                    {countdown > 0 && (
                      <div className="absolute inset-0 rounded-full border-8 border-blue-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-white text-xl font-bold uppercase tracking-wider">
                    {countdown > 0 ? 'Get Ready!' : 'Hold Still!'}
                  </p>
                </div>
              </div>
            )}

            {props.laserPosition && !props.isSwapped && (
              <div
                className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-red-500 bg-red-500/20 rounded-full animate-ping z-50 pointer-events-none shadow-lg"
                style={{
                  left: `${props.laserPosition.x * 100}%`,
                  top: `${props.laserPosition.y * 100}%`,
                }}
              />
            )}
            {props.activeMockupUrl && (
              <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6">
                <img
                  src={props.activeMockupUrl}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                  alt="Mockup"
                />
                <button
                  onClick={props.onCloseMockup}
                  className="absolute top-6 right-6 bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* PIP Window */}
          <div className="absolute bottom-4 left-4 z-30 w-28 aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden border border-white/20 shadow-xl group transition-transform hover:scale-105">
            {props.pipFeed ? (
              <VideoTrack
                trackRef={props.pipFeed}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Video size={20} className="text-gray-500" />
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                props.setIsSwapped(!props.isSwapped);
              }}
              className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-sm transition-all"
            >
              <ArrowRightLeft size={12} />
            </button>
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
        <MobileToolButton
          icon={ListTodo}
          onClick={() => {
            setShowMobileScope(true);
            setShowMobileMenu(false);
          }}
          colorClass="text-orange-500"
        />
        <MobileToolButton
          icon={props.isTranscribing ? Mic : MicOff}
          isActive={props.isTranscribing}
          onClick={props.onToggleTranscription}
          colorClass="text-red-500"
        />
        {props.deviceCount > 1 && (
          <MobileToolButton
            icon={SwitchCamera}
            onClick={props.onSwitchCamera}
            colorClass="text-purple-500"
          />
        )}
        <MobileToolButton
          icon={Share2}
          onClick={props.onCopyInvite}
          colorClass="text-blue-500"
        />
        <MobileToolButton
          variant="destructive"
          icon={PhoneOff}
          onClick={() => props.setShowEndDialog(true)}
        />
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
              <ScopeList roomId={props.roomId} slug={props.slug} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};