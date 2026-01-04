"use client";

import { 
  User, 
  Download, 
  CheckCircle2, 
  Play, 
  ArrowRight,
  ChevronRight, // Kept for other parts if needed
  Activity,
  AlertCircle,
  Paintbrush,
  Hammer,
  Clipboard,
  History,
  DatabaseZap, // Added from your snippet
  MicOff // Added for the empty state
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Room, BookingData } from "@/types/subdomain-type";
import { useMemo } from "react";

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

  // --- DERIVED REAL DATA ONLY ---
  const data = useMemo(() => {
    // 1. Group items strictly by their category for the "Task List" view
    const grouped = {
      REPAIR: scopeItems.filter(i => i.category === 'REPAIR'),
      PREP: scopeItems.filter(i => i.category === 'PREP'),
      PAINT: scopeItems.filter(i => i.category === 'PAINT'),
      NOTE: scopeItems.filter(i => i.category === 'NOTE'),
    };

    // 2. Count distinct categories found (for the summary chips)
    const activeCategories = Object.entries(grouped)
      .filter(([_, items]) => items.length > 0)
      .map(([key, items]) => ({ key, count: items.length }));

    return { grouped, activeCategories, total: scopeItems.length };
  }, [scopeItems]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-7rem)] bg-white">
      
      {/* 1. HEADER */}
      <header className="flex-none h-16 border-b border-zinc-200 flex items-center justify-between px-4 lg:px-6 bg-white z-10">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-zinc-900 tracking-tight">
              {room.roomKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5 font-medium">
              <span className="flex items-center gap-1.5 text-zinc-700">
                <User className="w-3.5 h-3.5" /> {room.clientName || "Client"}
              </span>
              <span className="text-zinc-300">|</span>
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" /> Survey Complete
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="hidden lg:flex items-center gap-2 mr-4 text-xs font-medium text-zinc-500">
              <span>SCOPE:</span>
              {data.activeCategories.map((cat) => (
                <span key={cat.key} className="px-2 py-1 bg-zinc-100 rounded-md text-zinc-700 border border-zinc-200">
                  {cat.count} {cat.key}
                </span>
              ))}
           </div>
  
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        
        {/* LEFT COLUMN (Video Only) */}
        <div className="w-full lg:flex-1 bg-zinc-50/50 flex flex-col relative lg:overflow-y-auto">
          <div className="flex-1 p-4 lg:p-8 flex flex-col items-center justify-center">
            
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                 <h2 className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Session Recording
                 </h2>
                 {room.recordingUrl && (
                   <span className="text-[10px] lg:text-xs font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                     REC
                   </span>
                 )}
              </div>

              {/* Video Player */}
              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl shadow-zinc-200 border border-zinc-200 group">
                {room.recordingUrl ? (
                  <video 
                    src={room.recordingUrl} 
                    controls 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 bg-zinc-900">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4 ring-1 ring-white/10">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                    <p className="font-medium text-zinc-300">No Recording Processed</p>
                  </div>
                )}
              </div>

              <div className="text-xs text-zinc-400 text-center mt-2 max-w-2xl mx-auto">
                Review the video to verify the specific locations of the repairs and paint boundaries listed in the scope.
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN (Actionable Sidebar) */}
        <div className="w-full lg:w-[420px] bg-white border-l border-zinc-200 flex flex-col z-20 shadow-xl shadow-zinc-200/50">
          
          <Tabs defaultValue="tasks" className="flex flex-col h-full">
            
            <div className="px-4 pt-4 pb-0 border-zinc-100">
              <TabsList className="w-full grid grid-cols-2 h-10 bg-zinc-100/80 p-1">
                <TabsTrigger value="tasks" className="text-xs font-medium gap-2">
                  <Clipboard className="w-3.5 h-3.5" /> Task List
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs font-medium gap-2">
                  <History className="w-3.5 h-3.5" /> Timeline Log
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: CATEGORIZED TASK LIST (Actionable) */}
            <TabsContent value="tasks" className="flex-1 mt-0 relative overflow-hidden focus-visible:ring-0">
               <ScrollArea className="h-full">
                  <div className="p-5 space-y-8">
                    
                    {data.total === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <Clipboard className="w-8 h-8 text-zinc-300 mb-2" />
                        <p className="text-sm text-zinc-500">No items detected.</p>
                      </div>
                    )}

                    {/* 1. REPAIRS (High Priority) */}
                    {data.grouped.REPAIR.length > 0 && (
                      <div className="space-y-3">
                         <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Required Repairs
                            </h4>
                            <Badge variant="outline" className="text-[10px] border-rose-200 bg-rose-50 text-rose-700 h-5">
                              {data.grouped.REPAIR.length} Items
                            </Badge>
                         </div>
                         <div className="space-y-2">
                           {data.grouped.REPAIR.map((item, i) => (
                             <div key={i} className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-rose-100 shadow-sm relative group hover:border-rose-300 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                  <div className="flex-1">
                                    <span className="font-semibold text-sm text-zinc-900 block leading-tight mb-1">{item.item}</span>
                                    {item.action && (
                                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 p-1.5 rounded w-fit">
                                        <Hammer className="w-3 h-3" /> {item.action}
                                      </div>
                                    )}
                                  </div>
                                </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}

                    {/* 2. PREP WORK */}
                    {data.grouped.PREP.length > 0 && (
                      <div className="space-y-3">
                         <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                           <Activity className="w-4 h-4" />
                           Preparation
                         </h4>
                         <div className="space-y-2">
                           {data.grouped.PREP.map((item, i) => (
                             <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-amber-100 shadow-sm hover:border-amber-300 transition-colors">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <div>
                                  <span className="text-sm font-medium text-zinc-900 block">{item.item}</span>
                                  {item.action && <span className="text-xs text-zinc-500 block mt-0.5">{item.action}</span>}
                                </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}

                    {/* 3. PAINTING */}
                    {data.grouped.PAINT.length > 0 && (
                      <div className="space-y-3">
                         <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                           <Paintbrush className="w-4 h-4" />
                           Painting Scope
                         </h4>
                         <div className="space-y-2">
                           {data.grouped.PAINT.map((item, i) => (
                             <div key={i} className="flex items-start gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <div>
                                  <span className="text-sm font-medium text-zinc-900 block">{item.item}</span>
                                  <span className="text-xs text-zinc-500 block mt-0.5">{item.action || "Paint application"}</span>
                                </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}
                    
                     {/* 4. NOTES */}
                     {data.grouped.NOTE.length > 0 && (
                      <div className="space-y-3">
                         <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                           Additional Notes
                         </h4>
                         <div className="space-y-2">
                           {data.grouped.NOTE.map((item, i) => (
                             <div key={i} className="flex items-start gap-3 px-3 py-2">
                                <div className="mt-2 w-1 h-1 rounded-full bg-zinc-300 shrink-0" />
                                <span className="text-sm text-zinc-500 italic">{item.item}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                    )}

                  </div>
               </ScrollArea>
            </TabsContent>

            {/* TAB 2: IMPROVED TIMELINE LOG */}
            <TabsContent value="timeline" className="flex-1 mt-0 relative overflow-hidden focus-visible:ring-0">
              <ScrollArea className="h-full">
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-end mb-1 px-1">
                    <div className="text-xs font-semibold text-zinc-500">INTEL</div>
                    <div className="text-[10px] text-zinc-400">{scopeItems.length} items</div>
                  </div>
                 
                  {scopeItems.length > 0 ? (
                    scopeItems.map((scope, i) => (
                      <div 
                        key={i} 
                        className="bg-zinc-50 rounded-md p-2 text-xs border border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        <div className="text-zinc-900 font-mono font-bold text-[10px] mb-1 flex gap-2 items-center uppercase tracking-wider">
                          <DatabaseZap className="w-3 h-3 text-zinc-900" />
                          {scope.category}
                        </div>
                        <div className="text-zinc-900 font-medium leading-relaxed">{scope.item}</div>
                        <div className="text-zinc-500 font-semibold mt-0.5">
                          {scope.action}
                        </div>
                        <div className="text-zinc-400 text-[10px] mt-1 font-mono">
                          {scope.timestamp}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40 text-center space-y-2">
                      <MicOff className="w-8 h-8 text-zinc-400" />
                      <p className="text-xs text-zinc-500">No items captured.</p>
                      <p className="text-[10px] text-zinc-400">Turn on 'Record' to start capturing scope.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-zinc-100 bg-white">
               <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm h-10">
                  Generate Work Order <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            </div>
          </Tabs>
        </div>

      </div>
    </div>
  );
}