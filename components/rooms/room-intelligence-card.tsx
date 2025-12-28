"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  AlertCircle, 
  BrainCircuit, 
  Sparkles, 
  Paintbrush, 
  Hammer, 
  Wrench, 
  StickyNote, 
  Terminal
} from "lucide-react";

// Helper to map category keys to Icons/Colors
const getCategoryStyle = (key: string) => {
  switch (key) {
    case "PREP":
      return { icon: Hammer, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" };
    case "PAINT":
      return { icon: Paintbrush, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" };
    case "REPAIR":
      return { icon: Wrench, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" };
    case "NOTE":
      return { icon: StickyNote, color: "text-zinc-500", bg: "bg-zinc-500/10 border-zinc-500/20" };
    default:
      return { icon: Sparkles, color: "text-primary", bg: "bg-primary/10 border-primary/20" };
  }
};

export default function RoomIntelligenceCard({ subdomain }: { subdomain: any }) {
  const intel = subdomain?.roomIntelligence?.intelligence;
  
  // STATIC DEMO EXAMPLE (Visual only)
  const demoExample = {
    transcript: "Let's do two coats of Benjamin Moore White Dove in eggshell",
    output: {
      category: "PAINT",
      item: "Room walls",
      action: "2 coats Benjamin Moore White Dove (eggshell)"
    }
  };

  return (
    <div className="flex-1 h-full">
      <Card className="h-full flex flex-col border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
               
                Scope Intelligence
              </CardTitle>
              <CardDescription className="mt-1">
                Active extraction logic model v1.0
              </CardDescription>
            </div>
            {subdomain.roomIntelligence && (
               <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5 py-1 px-2.5">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                 Online
               </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-6">
          {subdomain.roomIntelligence ? (
            <>
              {/* SECTION 1: THE BRAIN (Categories) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  Detection Logic
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {intel?.categories && Object.entries(intel.categories).map(([key, desc]: [string, any]) => {
                    const style = getCategoryStyle(key);
                    const Icon = style.icon;
                    return (
                      <div key={key} className={`p-3 rounded-lg border ${style.bg} flex gap-3 items-start`}>
                        <div className={`mt-0.5 p-1.5 rounded-md bg-white/50 dark:bg-black/20 ${style.color}`}>
                           <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${style.color}`}>{key}</div>
                          <div className="text-[10px] text-muted-foreground leading-snug mt-1 line-clamp-2">
                            {desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: THE SIMULATION (Static Demo) */}
              <div className="mt-auto space-y-3 pt-4 border-t border-dashed">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                   <Sparkles className="w-3 h-3" />
                   Live Logic Preview
                </h4>
                
                <div className="bg-zinc-950 rounded-lg p-4 font-mono text-xs text-zinc-300 space-y-3 shadow-inner">
                   <div className="flex gap-3">
                      <span className="text-zinc-500 shrink-0">INPUT &gt;</span>
                      <span className="text-zinc-100">"{demoExample.transcript}"</span>
                   </div>
                   
                   <div className="h-px bg-white/10 w-full" />
                   
                   <div className="flex gap-3">
                      <span className="text-purple-400 shrink-0">AI_EXTRACT &gt;</span>
                      <div className="space-y-1">
                        <div><span className="text-zinc-500">Category:</span> <span className="text-blue-300">"{demoExample.output.category}"</span></div>
                        <div><span className="text-zinc-500">Item:</span> <span className="text-yellow-300">"{demoExample.output.item}"</span></div>
                        <div><span className="text-zinc-500">Action:</span> <span className="text-green-300">"{demoExample.output.action}"</span></div>
                      </div>
                   </div>
                </div>
              </div>
            </>
          ) : (
            // OFFLINE STATE
            <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3 opacity-80">
              <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-amber-900">Intelligence Offline</h3>
                <p className="text-sm text-amber-700/80 max-w-[250px] mx-auto mt-1">
                  The AI model has not been seeded for this subdomain.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}