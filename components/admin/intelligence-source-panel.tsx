"use client";

import { Sparkles, Loader2 } from "lucide-react";

interface IntelligenceSourcePanelProps {
  context: string;
  setContext: (val: string) => void;
  onGenerate: () => void;
  status: "idle" | "generating" | "saving" | "success" | "error";
}

export function IntelligenceSourcePanel({
  context,
  setContext,
  onGenerate,
  status,
}: IntelligenceSourcePanelProps) {
  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col h-full bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
        <h2 className="font-semibold text-sm flex items-center gap-2 text-zinc-700">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Source Requirements
        </h2>
      </div>
      <div className="flex-1 relative">
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="w-full h-full p-5 text-sm text-zinc-700 leading-relaxed outline-none resize-none placeholder:text-zinc-300"
          placeholder="Paste the business logic, pricing rules, and requirements here..."
        />
      </div>
      <div className="p-4 border-t border-zinc-100 bg-white">
        <button
          onClick={onGenerate}
          disabled={!context || status === "generating"}
          className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-purple-100 disabled:opacity-50"
        >
          {status === "generating" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {status === "generating" ? "Analyzing..." : "Auto-Build Configuration"}
        </button>
      </div>
    </div>
  );
}