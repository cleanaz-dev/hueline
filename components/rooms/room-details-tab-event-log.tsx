"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { DatabaseZap, MicOff } from "lucide-react";
import { ScopeItem } from "@/types/room-types";
import { useMemo } from "react";

interface RoomDetailsTabEventLogProps {
  items: ScopeItem[];
  activeArea: string;
  presignedUrls?: Record<string, string>;
}

export function RoomDetailsTabEventLog({ 
  items, 
  activeArea,
  presignedUrls = {} 
}: RoomDetailsTabEventLogProps) {
  // Filter items based on activeArea
  const filteredItems = useMemo(() => {
    if (activeArea === "ALL") return items;
    return items.filter((item) => item.area === activeArea);
  }, [items, activeArea]);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-end mb-1 px-1">
          <div className="text-xs font-semibold text-zinc-500">INTEL FEED</div>
          <div className="text-[10px] text-zinc-400 font-mono">
            {filteredItems.length} EVENTS
          </div>
        </div>

        {filteredItems.length > 0 ? (
          filteredItems.map((scope, i) => {
            const imageKey = scope.image_urls?.[0];
            const imageUrl = imageKey ? presignedUrls[imageKey] : null;

            return (
              <div
                key={i}
                className="bg-zinc-50 rounded-md p-2 text-xs border border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <div className="text-zinc-900 font-mono font-bold text-[10px] mb-1 flex justify-between items-center uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <DatabaseZap className="w-3 h-3 text-zinc-900" />
                    {scope.type}
                  </span>
                  <span className="text-zinc-400 font-sans capitalize">
                    {scope.area}
                  </span>
                </div>
                
                {/* FLEX ROW: TEXT ON LEFT, IMAGE ON RIGHT */}
                <div className="flex justify-between items-start gap-3">
                  {/* LEFT SIDE: ITEM AND ACTION */}
                  <div className="flex-1">
                    <div className="text-zinc-900 font-medium leading-relaxed capitalize">
                      {scope.item}
                    </div>
                    <div className="text-zinc-500 font-semibold mt-0.5">
                      {scope.action}
                    </div>
                  </div>
                  
                  {/* RIGHT SIDE: IMAGE */}
                  {scope.type === "IMAGE" && imageUrl && (
                    <img
                      src={imageUrl}
                      alt={scope.area}
                      className="size-10 object-cover rounded-sm bg-white border border-zinc-200 flex-shrink-0"
                    />
                  )}
                </div>
                
                <div className="text-zinc-400 text-[10px] mt-1 font-mono">
                  {new Date(scope.timestamp).toLocaleString()}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40 text-center space-y-2">
            <MicOff className="w-8 h-8 text-zinc-400" />
            <p className="text-xs text-zinc-500">No items captured.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}