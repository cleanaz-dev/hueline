"use client";

import { Radar, Quote, ArrowRight, Info, Hammer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LogicExplainer } from "./logic-explainer";

export function RoomVisionTab({ examples }: { examples: any[] }) {
  return (
    <div className="outline-none animate-in fade-in slide-in-from-bottom-1 duration-300">
      <LogicExplainer
        icon={Radar}
        title="Real-Time Processing"
        description="Automatically converts spoken descriptions into detailed scope items during calls while ignoring non-actionable conversation, ensuring every detail is captured accurately."
        exampleTitle="Speech Conversion"
        exampleContent={
          <div className="space-y-2">
            <p>Input: <span className="italic">"There's mold in the corner."</span></p>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3 text-zinc-400" />
              <span className="font-bold">Wood Rot Repair</span>
            </div>
          </div>
        }
      />

      <div className="border border-zinc-200 rounded-xl shadow-sm overflow-hidden bg-white">
        <div className="divide-y divide-zinc-100">
          {examples.map((ex: any, i: number) => {
            const hasAction = !!ex.output?.category;
            return (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                {/* INPUT */}
                <div className="flex-1 flex gap-3 min-w-0">
                  <Quote className="w-4 h-4 text-zinc-300 shrink-0 transform scale-x-[-1] mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Input</span>
                    <p className="text-sm text-zinc-700 font-medium italic">"{ex.transcript}"</p>
                  </div>
                </div>

                <div className="hidden md:flex shrink-0 text-zinc-300">
                  <ArrowRight className="w-4 h-4" />
                </div>

                {/* OUTPUT */}
                <div className="flex-1 md:pl-6">
                  {hasAction ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Result</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] h-5 px-1.5 border-none">
                          {ex.output.category}
                        </Badge>
                        <span className="text-sm font-bold text-zinc-900">{ex.output.item}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Hammer className="w-3 h-3 text-zinc-400" />
                        <span className="truncate">Action: {ex.output.action}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 h-full text-zinc-400">
                      <Info className="w-4 h-4" />
                      <span className="text-xs">No scope action triggered</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {examples.length === 0 && (
            <div className="p-12 text-center text-zinc-400 italic">
              No vision scenarios available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}