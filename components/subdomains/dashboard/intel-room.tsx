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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SecureVideoPlayer } from "@/components/rooms/video/secure-video-player";

// --- TYPES & CONFIG (Same as before) ---
interface ScopeItem {
  type: string;
  area: string;
  item: string;
  action: string;
  image_urls?: string[];
  timestamp: string;
}

interface IntelRoomProps {
  rooms?: any[];
  createdAt?: string | Date;
  presignedUrls?: Record<string, string>;
}

const CATEGORY_ORDER = ["REPAIR", "PREP", "PAINT", "NOTE"];

const SCOPE_CONFIG = (type: string) => {
  switch (type) {
    case "REPAIR": return { label: "Repair", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" };
    case "PREP": return { label: "Prep", icon: Hammer, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
    case "PAINT": return { label: "Paint", icon: Paintbrush, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
    case "NOTE": return { label: "Note", icon: StickyNote, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-100" };
    default: return { label: "Item", icon: ClipboardCheck, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" };
  }
};

export function IntelRoom({ rooms, createdAt, presignedUrls = {} }: IntelRoomProps) {
  // Default to expanded if there is data, but you can change to false
  const [isExpanded, setIsExpanded] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Data Processing
  const { scopeData, totalScopeItems, displayDate, videoRoomId } = useMemo(() => {
    if (!rooms || rooms.length === 0) return { scopeData: [], totalScopeItems: 0, displayDate: new Date(), videoRoomId: null };

    const allItems = rooms.flatMap((r) => (r.scopeData as unknown as ScopeItem[]) || []);
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

  if (totalScopeItems === 0) return null;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 transition-all duration-200 hover:shadow-md">
      {/* CLICKABLE HEADER */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-4 cursor-pointer bg-white hover:bg-slate-50/50 transition-colors flex justify-between items-center group select-none"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200",
            isExpanded ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
          )}>
            <ClipboardCheck className="w-4 h-4" />
          </div>
          
          <div className="flex flex-col">
            <h4 className="font-bold text-sm text-slate-900">Site Survey Snapshot</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{displayDate.toLocaleDateString()}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>{totalScopeItems} Items detected</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {videoRoomId && (
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full uppercase tracking-wide">
              <PlayCircle className="w-3 h-3" />
              Video Available
            </div>
          )}
          <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-300", isExpanded && "rotate-180")} />
        </div>
      </div>

      {/* EXPANDABLE CONTENT */}
      <div className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out",
        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 bg-slate-50/50 p-4">
            
            {/* VIDEO TOGGLE (Inside Content) */}
            {videoRoomId && (
              <div className="mb-6">
                 {!showVideo ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setHasStarted(true); setShowVideo(true); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
                    >
                      <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Watch Walkthrough Video
                    </button>
                 ) : (
                   <div className="relative w-full rounded-lg overflow-hidden bg-black border border-slate-800 shadow-xl">
                      <div className="aspect-video">
                        <SecureVideoPlayer roomId={videoRoomId} className="w-full h-full" />
                      </div>
                      <button 
                        onClick={() => setShowVideo(false)}
                        className="absolute top-3 right-3 p-1 bg-black/50 text-white rounded-full hover:bg-black/80 backdrop-blur-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                   </div>
                 )}
              </div>
            )}

            {/* SCOPE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scopeData.map(([area, items]) => {
                const areaImages = items
                  .filter((i) => i.type === "IMAGE" && i.image_urls)
                  .flatMap((i) => i.image_urls!.map(key => presignedUrls[key]).filter(Boolean));

                // Group items by type for cleaner display
                const itemsByType: Record<string, ScopeItem[]> = {};
                items.forEach((i) => {
                  if (!itemsByType[i.type]) itemsByType[i.type] = [];
                  itemsByType[i.type].push(i);
                });

                return (
                  <div key={area} className="flex flex-col gap-3 p-3.5 rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                    
                    {/* Area Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wide">
                        <div className="p-1 rounded bg-slate-100 text-slate-500"><MapPin className="w-3 h-3" /></div>
                        {area}
                      </div>
                      {areaImages.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                          <ImageIcon className="w-3 h-3" />
                          {areaImages.length}
                        </div>
                      )}
                    </div>

                    {/* Images Preview */}
                    {areaImages.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        {areaImages.map((img, idx) => (
                          <div key={idx} className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-100 relative group cursor-zoom-in">
                            <img src={img} alt={area} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* List Items */}
                    <div className="space-y-3 mt-1">
                      {CATEGORY_ORDER.map((cat) => {
                        const catItems = itemsByType[cat];
                        if (!catItems?.length) return null;
                        const config = SCOPE_CONFIG(cat);
                        const Icon = config.icon;

                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={cn("w-1.5 h-1.5 rounded-full", config.bg.replace('bg-', 'bg-').replace('50', '400'))} />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{config.label}</span>
                            </div>
                            {catItems.map((scopeItem, idx) => (
                              <div key={idx} className="relative group pl-3 py-1 border-l-2 border-slate-100 hover:border-slate-300 transition-colors">
                                <p className="text-xs font-medium text-slate-700 leading-snug">
                                  {scopeItem.item}
                                  {scopeItem.action && <span className="text-slate-400 font-normal ml-1">— {scopeItem.action}</span>}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}