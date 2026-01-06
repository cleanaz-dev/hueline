"use client";

import { useState, useMemo } from "react";
import { Clipboard, History, ArrowRight, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Import new split components
import { RoomDetailsTabSow } from "./room-details-tab-sow";
import { RoomDetailsTabEventLog } from "./room-details-tab-event-log";

// --- TYPES ---
// Updated to support images
export interface ScopeItem {
  id?: string;
  type: string;
  area: string;
  item: string;
  action: string;
  timestamp: string;
  // Support single image or array
  image_url?: string | null;
  images?: string[];
}

interface RoomDetailsTabsProps {
  items: ScopeItem[];
  roomId: string;
}

export function RoomDetailsTabs({ items, roomId }: RoomDetailsTabsProps) {
  const [activeArea, setActiveArea] = useState<string>("ALL");

  // --- UNIQUE AREAS FOR FILTERING ---
  const uniqueAreas = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.area))).sort();
  }, [items]);

  return (
    <div className="w-full h-full bg-white border-l border-zinc-200 flex flex-col shadow-xl shadow-zinc-200/50">
      <Tabs defaultValue="tasks" className="flex flex-col h-full">
        {/* --- HEADER --- */}
        <div className="px-4 pt-4 pb-2 border-b border-zinc-100 bg-white z-10">
          <TabsList className="w-full grid grid-cols-2 h-10 bg-zinc-100/80 p-1 mb-3">
            <TabsTrigger
              value="tasks"
              className="text-xs font-medium gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Clipboard className="w-3.5 h-3.5" /> Scope of Work
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="text-xs font-medium gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <History className="w-3.5 h-3.5" /> Event Log
            </TabsTrigger>
          </TabsList>

          {/* AREA FILTER BAR */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-2 shrink-0">
              <Filter className="w-3 h-3" /> Area:
            </div>
            <button
              onClick={() => setActiveArea("ALL")}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-semibold transition-colors shrink-0 border",
                activeArea === "ALL"
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
              )}
            >
              All
            </button>
            {uniqueAreas.map((area) => (
              <button
                key={area}
                onClick={() => setActiveArea(area)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-semibold transition-colors shrink-0 capitalize border",
                  activeArea === area
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                )}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* --- TAB CONTENT: SCOPE OF WORK --- */}
        <TabsContent
          value="tasks"
          className="flex-1 mt-0 relative overflow-hidden focus-visible:ring-0"
        >
          <RoomDetailsTabSow
            initialItems={items}
            activeArea={activeArea}
            roomId={roomId}
          />
        </TabsContent>

        {/* --- TAB CONTENT: EVENT LOG --- */}
        <TabsContent
          value="timeline"
          className="flex-1 mt-0 relative overflow-hidden focus-visible:ring-0"
        >
          <RoomDetailsTabEventLog items={items} />
        </TabsContent>

        {/* --- FOOTER --- */}
      </Tabs>
    </div>
  );
}
