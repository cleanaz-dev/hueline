import React, { useState } from "react";
import { VideoTrack } from "@livekit/components-react";
import {
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
  Info,
  Layers,
  Briefcase,
  DollarSign,
  PhoneOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ScopeList from "./room-scope-list";
import { PainterUIProps } from "./painter-stage";
import { useCameraEvents } from "@/hooks/use-camera-events";

// Local Component
const SidebarTab = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
      active
        ? "border-blue-600 text-blue-600 bg-blue-50/50"
        : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
    )}
  >
    <Icon size={14} />
    {label}
  </button>
);

const ToolButton = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  colorClass,
  variant = "default",
}: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-3 rounded-xl border w-full transition-all duration-200 group shadow-sm hover:shadow-md",
      variant === "destructive"
        ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100 hover:border-red-200"
        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-300",
      variant !== "destructive" &&
        isActive &&
        "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
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
    <span
      className={cn(
        "text-[9px] font-bold uppercase tracking-wider mt-2",
        variant === "destructive"
          ? "text-red-700"
          : isActive
          ? "text-blue-700"
          : "text-gray-500 group-hover:text-gray-900"
      )}
    >
      {label}
    </span>
  </button>
);

export const PainterStageDesktop = (props: PainterUIProps) => {
  const [activeTab, setActiveTab] = useState<"controls" | "info">("controls");
  const { countdown, isCapturing } = useCameraEvents(props.slug, props.roomId);

  return (
    <div className="flex w-full h-full">
      {/* VIDEO STAGE (CENTER) */}
      <div className="flex-1 relative flex flex-col min-w-0">
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

        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center bg-black rounded-2xl shadow-2xl overflow-hidden border border-gray-900/10">
            <div
              ref={props.containerRef}
              onClick={props.onPointer}
              className="w-full h-full flex items-center justify-center cursor-crosshair relative"
            >
              {props.mainFeed ? (
                <VideoTrack
                  trackRef={props.mainFeed}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
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
            <div className="absolute bottom-4 left-4 z-30 w-36 aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden border border-white/20 shadow-xl group transition-transform hover:scale-105">
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
      </div>

      {/* RIGHT SIDEBAR (CONTROLS) */}
      <div className="flex flex-col w-[400px] bg-white border-l border-gray-200 shrink-0 z-30 shadow-sm">
        <div className="flex items-center border-b border-gray-200 bg-gray-50/50">
          <SidebarTab
            active={activeTab === "controls"}
            onClick={() => setActiveTab("controls")}
            icon={Layers}
            label="Workspace"
          />
          <SidebarTab
            active={activeTab === "info"}
            onClick={() => setActiveTab("info")}
            icon={Info}
            label="Job Details"
          />
        </div>

        {activeTab === "controls" && (
          <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
            <div className="p-5 border-b border-gray-200 bg-white">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Settings size={12} /> Stage Controls
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ToolButton
                  icon={props.copied ? Check : Share2}
                  label={props.copied ? "Copied" : "Invite Client"}
                  onClick={props.onCopyInvite}
                  colorClass="text-blue-600"
                />
                <ToolButton
                  icon={Camera}
                  label="Take Snapshot"
                  onClick={() => console.log("snap")}
                />
                <ToolButton
                  icon={props.isTranscribing ? Mic : MicOff}
                  label={props.isTranscribing ? "Transcribing" : "Start Record"}
                  isActive={props.isTranscribing}
                  onClick={props.onToggleTranscription}
                  colorClass="text-red-500"
                />
                {props.deviceCount > 1 && (
                  <ToolButton
                    icon={SwitchCamera}
                    label="Flip Camera"
                    onClick={props.onSwitchCamera}
                    colorClass="text-purple-500"
                  />
                )}
                <ToolButton
                  variant="destructive"
                  icon={PhoneOff}
                  label="End Session"
                  onClick={() => props.setShowEndDialog(true)}
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 p-5">
              <div className="flex-1 overflow-y-auto pr-1">
                <ScopeList roomId={props.roomId} slug={props.slug} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "info" && props.booking && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {props.booking.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {props.booking.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {props.booking.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Briefcase size={12} />
                    <span className="text-[10px] font-bold uppercase">
                      Room Type
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {props.booking.roomType}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <DollarSign size={12} />
                    <span className="text-[10px] font-bold uppercase">
                      Est. Value
                    </span>
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    ${props.booking.estimatedValue?.toLocaleString() || "0"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2 pl-1">
                  AI Summary
                </label>
                <div className="p-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-600 leading-relaxed shadow-sm">
                  {props.booking.summary || "No summary available."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};