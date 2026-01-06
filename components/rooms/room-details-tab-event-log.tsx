"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { DatabaseZap, MicOff, MapPin } from "lucide-react";
import { ScopeItem } from "./room-details-tabs";

interface RoomDetailsTabEventLogProps {
  items: ScopeItem[];
}

export function RoomDetailsTabEventLog({ items }: RoomDetailsTabEventLogProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-end mb-1 px-1">
          <div className="text-xs font-semibold text-zinc-500">INTEL FEED</div>
          <div className="text-[10px] text-zinc-400 font-mono">{items.length} EVENTS</div>
        </div>
        
        {items.length > 0 ? (
          items.map((scope, i) => (
            <div 
              key={i} 
              className="bg-zinc-50 rounded-md p-2 text-xs border border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="text-zinc-900 font-mono font-bold text-[10px] mb-1 flex justify-between items-center uppercase tracking-wider">
                <span className="flex items-center gap-2">
                    <DatabaseZap className="w-3 h-3 text-zinc-900" />
                    {scope.type}
                </span>
                <span className="text-zinc-400 font-sans capitalize">{scope.area}</span>
              </div>
              <div className="text-zinc-900 font-medium leading-relaxed">{scope.item}</div>
              <div className="text-zinc-500 font-semibold mt-0.5">
                {scope.action}
              </div>
              <div className="text-zinc-400 text-[10px] mt-1 font-mono">
                {new Date(scope.timestamp).toLocaleString()}
              </div>
            </div>
          ))
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