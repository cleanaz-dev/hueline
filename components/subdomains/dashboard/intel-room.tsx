"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  ClipboardCheck,
  MapPin,
  AlertTriangle,
  Hammer,
  Paintbrush,
  StickyNote,
  Image as ImageIcon,
  PlayCircle,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SecureVideoPlayer } from "@/components/rooms/video/secure-video-player";

// --- TYPES ---
interface ScopeItem {
  type: string;
  area: string;
  item: string;
  action: string;
  image_urls?: string[];
  image_id?: string;
  timestamp: string;
}

interface IntelRoomProps {
  rooms?: any[];
  createdAt?: string | Date;
  presignedUrls?: Record<string, string>;
}

// --- CONFIG ---
const CATEGORY_ORDER = ["REPAIR", "PREP", "PAINT", "NOTE"];

const SCOPE_CONFIG = (type: string) => {
  switch (type) {
    case "REPAIR":
      return {
        label: "Repair",
        icon: AlertTriangle,
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-100",
      };
    case "PREP":
      return {
        label: "Prep",
        icon: Hammer,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
      };
    case "PAINT":
      return {
        label: "Paint",
        icon: Paintbrush,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100",
      };
    case "NOTE":
      return {
        label: "Note",
        icon: StickyNote,
        color: "text-slate-500",
        bg: "bg-slate-50",
        border: "border-slate-100",
      };
    default:
      return {
        label: "Item",
        icon: ClipboardCheck,
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-100",
      };
  }
};

export function IntelRoom({ rooms, createdAt, presignedUrls = {} }: IntelRoomProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [videoHeight, setVideoHeight] = useState(0);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showVideo && videoContainerRef.current) {
      const contentHeight = videoContainerRef.current.scrollHeight;
      setVideoHeight(contentHeight);
    } else {
      setVideoHeight(0);
    }
  }, [showVideo]);

  const { scopeData, totalScopeItems, displayDate, videoRoomId } = useMemo(() => {
    if (!rooms || rooms.length === 0)
      return {
        scopeData: [],
        totalScopeItems: 0,
        displayDate: new Date(),
        videoRoomId: null,
      };

    const allItems = rooms.flatMap(
      (r) => (r.scopeData as unknown as ScopeItem[]) || []
    );

    const grouped: Record<string, ScopeItem[]> = {};
    allItems.forEach((item) => {
      if (!item || !item.area) return;
      if (!grouped[item.area]) grouped[item.area] = [];
      grouped[item.area].push(item);
    });

    const rawDate = createdAt || rooms[0]?.createdAt || new Date();
    const roomWithVideo = rooms.find((r) => r.recordingUrl);

    return {
      scopeData: Object.entries(grouped),
      totalScopeItems: allItems.length,
      displayDate: new Date(rawDate),
      videoRoomId: roomWithVideo ? roomWithVideo.roomKey : null,
    };
  }, [rooms, createdAt]);

  const handleToggleVideo = () => {
    if (!hasStarted) setHasStarted(true);
    setShowVideo((prev) => !prev);
  };

  if (totalScopeItems === 0) return null;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-300 border-t-4 border-t-slate-300 shadow-lg shadow-slate-200/50 overflow-hidden mb-8">
      {/* HEADER */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 border border-slate-900 rounded-md shadow-sm">
            <ClipboardCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 leading-none mb-1">
              Site Survey Snapshot
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                {totalScopeItems} Total Items
              </span>

              {videoRoomId && (
                <button
                  onClick={handleToggleVideo}
                  className={cn(
                    "group flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded border transition-all ml-1 select-none",
                    showVideo
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-accent border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
                  )}
                >
                  <PlayCircle 
                    className={cn(
                      "w-3 h-3 transition-transform duration-300", 
                      showVideo && "rotate-90"
                    )} 
                  />
                  {showVideo ? "Close Video" : "Watch Walkthrough"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end leading-tight opacity-80">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
            {displayDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-[10px] font-medium text-slate-400 tabular-nums">
            {displayDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* VIDEO PLAYER SECTION */}
      <div
        className="overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ 
          maxHeight: showVideo ? `${videoHeight}px` : '0px',
        }}
      >
        <div
          ref={videoContainerRef}
          className={cn(
            "bg-slate-900 border-b border-slate-200 transition-opacity duration-500",
            showVideo ? "opacity-100 delay-200" : "opacity-0"
          )}
        >
          {hasStarted && videoRoomId && (
            <div className="relative w-full aspect-video mx-auto bg-black group">
              <SecureVideoPlayer roomId={videoRoomId} className="w-full h-full" />
              
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-50 transform hover:scale-105"
                aria-label="Close video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/30">
        {scopeData.map(([area, items]) => {
          const areaImages = items
            .filter((i) => i.type === "IMAGE" && i.image_urls)
            .flatMap((i) => i.image_urls!.map(key => presignedUrls[key]).filter(Boolean));

          const itemsByType: Record<string, ScopeItem[]> = {};
          items.forEach((i) => {
            if (!itemsByType[i.type]) itemsByType[i.type] = [];
            itemsByType[i.type].push(i);
          });

          return (
            <div
              key={area}
              className="flex flex-col gap-3 p-3 rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wide">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {area}
                </div>
                {areaImages.length > 0 && (
                  <div className="flex items-center gap-1 text-[9px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    <ImageIcon className="w-2.5 h-2.5" />
                    {areaImages.length}
                  </div>
                )}
              </div>

              {areaImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {areaImages.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-md overflow-hidden border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={img}
                        alt="Scope"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                  {areaImages.length > 4 && (
                    <div className="flex items-center justify-center bg-slate-50 text-[9px] text-slate-400 font-medium rounded-md border border-slate-200">
                      +{areaImages.length - 4}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 mt-1">
                {CATEGORY_ORDER.map((cat) => {
                  const catItems = itemsByType[cat];
                  if (!catItems || catItems.length === 0) return null;
                  const config = SCOPE_CONFIG(cat);
                  const Icon = config.icon;

                  return (
                    <div key={cat} className="space-y-1.5">
                      <div
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wider ml-1 opacity-70",
                          config.color
                        )}
                      >
                        {config.label}
                      </div>

                      <div className="space-y-1">
                        {catItems.map((scopeItem, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 bg-slate-50/50 p-2 rounded border border-slate-100 hover:border-slate-200 transition-colors"
                          >
                            <div
                              className={cn(
                                "mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border",
                                config.bg,
                                config.border
                              )}
                            >
                              <Icon
                                className={cn("w-2.5 h-2.5", config.color)}
                              />
                            </div>
                            <div className="flex-1 flex justify-between items-start gap-2 min-w-0">
                              <span className="text-xs font-semibold text-slate-700 leading-snug truncate capitalize">
                                {scopeItem.item}
                              </span>
                              {scopeItem.action && (
                                <span className="text-[10px] font-mono uppercase tracking-wide text-slate-400 shrink-0 mt-0.5">
                                  {scopeItem.action}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}