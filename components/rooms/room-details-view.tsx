"use client";

import { 
  User, 
  Download, 
  DatabaseZap, 
  CheckCircle2, 
  Play,
  ArrowRight,
  ChevronRight,
  Activity,
  Menu // Added for mobile menu trigger if needed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Room, BookingData } from "@/types/subdomain-type";

interface RoomDetailsProps {
  room: Room & { booking?: BookingData };
}

interface ScopeItem {
  id: string;
  category: 'PREP' | 'PAINT' | 'REPAIR' | 'NOTE';
  item: string;
  action: string;
  timestamp: string;
}

export function RoomDetailsView({ room }: RoomDetailsProps) {
  const scopeItems = (Array.isArray(room.scopeData) 
    ? room.scopeData 
    : (room.scopeData as any)?.items || []) as ScopeItem[];

  const categories = scopeItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    // PARENT CONTAINER: 
    // Mobile: Auto height, normal scrolling. 
    // Desktop (lg): Fixed height, hidden overflow (internal scrolling).
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-7rem)]">
      
      {/* 1. HEADER */}
      <header className="flex-none h-16 border-b border-zinc-100 flex items-center justify-between px-4 lg:px-6 bg-white z-10 ">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg lg:text-xl font-semibold text-zinc-900 tracking-tight truncate max-w-[200px] sm:max-w-md">
              {room.roomKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <div className="flex items-center gap-2 lg:gap-3 text-xs text-zinc-500 mt-0.5 font-medium">
              <span className="hidden sm:flex items-center gap-1.5 text-zinc-900">
                <User className="w-3.5 h-3.5" /> {room.clientName || "Client"}
              </span>
              <span className="hidden sm:inline text-zinc-200">/</span>
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Complete
              </span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="h-8 text-xs gap-2 border-zinc-200 text-zinc-600 hover:text-zinc-900">
          <Download className="w-3.5 h-3.5" /> 
          <span className="hidden sm:inline">Export</span>
        </Button>
      </header>

      {/* 2. MAIN CONTENT WRAPPER */}
      {/* Mobile: Vertical Flex (Stack). Desktop: Horizontal Flex (Row) */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        
        {/* LEFT COLUMN (VIDEO) */}
        {/* Mobile: w-full. Desktop: flex-1 (takes remaining space) */}
        <div className="w-full lg:flex-1 bg-zinc-50/50 flex flex-col relative lg:overflow-y-auto">
          <div className="flex-1 p-4 lg:p-8 flex flex-col items-center justify-start lg:justify-center">
            
            {/* Video Container */}
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
               {/* Label */}
              <div className="flex items-center justify-between px-1">
                 <h2 className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Session Recording
                 </h2>
                 {room.recordingUrl && (
                   <span className="text-[10px] lg:text-xs font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                     REC
                   </span>
                 )}
              </div>

              {/* The Player - Standard 16:9 Aspect Ratio */}
              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-xl lg:shadow-2xl shadow-zinc-200/50 border border-zinc-200 ring-1 ring-zinc-900/5 group">
                {room.recordingUrl ? (
                  <video 
                    src={room.recordingUrl} 
                    controls 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 bg-zinc-900">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 ring-1 ring-white/10">
                      <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-current ml-1" />
                    </div>
                    <p className="font-medium text-zinc-300 text-sm lg:text-base">No Recording Processed</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN (SIDEBAR / TIMELINE) */}
        {/* Mobile: w-full, auto height. Desktop: w-[400px], full height. */}
        <div className="w-full lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-zinc-100 flex flex-col z-20 shadow-none lg:shadow-[-10px_0_40px_-15px_rgba(0,0,0,0.03)]">
          
          {/* Sidebar Header */}
          <div className="p-4 lg:p-5 border-b border-zinc-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-100 rounded-md">
                <DatabaseZap className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="font-semibold text-sm text-zinc-800">Detected Scope</span>
            </div>
            {/* Hide detailed stats on very small screens, show simple count */}
            <div className="flex gap-1.5">
               <span className="text-xs text-zinc-500 font-medium bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
                 {scopeItems.length} Items
               </span>
            </div>
          </div>

          {/* Sidebar Content */}
          {/* ScrollArea handles the internal scrolling on Desktop */}
          {/* On Mobile, we disable the ScrollArea's restricted height logic essentially by letting the parent div grow */}
          <div className="flex-1 lg:overflow-hidden relative">
            <ScrollArea className="h-[400px] lg:h-full w-full">
              <div className="p-5">
                {scopeItems.length > 0 ? (
                  <div className="space-y-0 relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-zinc-100" />

                    {scopeItems.map((item, idx) => (
                      <div key={item.id || idx} className="relative pl-8 pb-6 last:pb-0 group">
                        
                        {/* Timeline Node */}
                        <div className={cn(
                          "absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10",
                          item.category === 'PREP' && "bg-amber-400",
                          item.category === 'PAINT' && "bg-blue-500",
                          item.category === 'REPAIR' && "bg-rose-500",
                          item.category === 'NOTE' && "bg-zinc-400",
                        )} />

                        {/* Content Block */}
                        <div className="flex flex-col gap-1 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-sm uppercase",
                              item.category === 'PREP' && "bg-amber-50 text-amber-700",
                              item.category === 'PAINT' && "bg-blue-50 text-blue-700",
                              item.category === 'REPAIR' && "bg-rose-50 text-rose-700",
                              item.category === 'NOTE' && "bg-zinc-100 text-zinc-600",
                            )}>
                              {item.category}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">{item.timestamp}</span>
                          </div>
                          
                          <p className="text-sm font-medium text-zinc-800 leading-snug mt-1">
                            {item.item}
                          </p>
                          
                          {item.action && (
                            <div className="flex items-start gap-1.5 mt-1 text-xs text-zinc-500">
                              <ChevronRight className="w-3 h-3 mt-0.5 text-zinc-300" />
                              <span>{item.action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 lg:py-20 opacity-60">
                    <DatabaseZap className="w-8 h-8 text-zinc-300 mb-2" />
                    <p className="text-sm text-zinc-500">No scope items captured.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 sticky bottom-0 lg:static">
             <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-10 lg:h-9 text-sm lg:text-xs shadow-none">
                Generate Report <ArrowRight className="w-3 h-3 ml-2" />
             </Button>
          </div>
        </div>

      </div>
    </div>
  );
}