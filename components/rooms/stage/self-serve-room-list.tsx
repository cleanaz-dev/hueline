"use client";

import { useEffect, useRef, useState } from "react";
import {
  DatabaseZap,
  MicOffIcon,
  Brush,
  Hammer,
  Camera,
  HelpCircle,
  CheckCircle2,
  Loader2,
  X,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Shared Types
export interface ScopeItem {
  type: "PREP" | "PAINT" | "NOTE" | "IMAGE" | "QUESTION" | string;
  area: string;
  item: string;
  action: string;
  timestamp: string;
  image_path?: string | null;
}

interface ScopeListProps {
  scopes: ScopeItem[]; // <--- NOW RECEIVES DATA AS PROP
  isConnected: boolean;
}

// --- SECURE THUMBNAIL (Internal Helper) ---
const SecureThumbnail = ({ storageKey, alt }: { storageKey: string; alt: string }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchUrl = async () => {
      try {
        const res = await fetch(`/api/storage/sign?key=${encodeURIComponent(storageKey)}`);
        const data = await res.json();
        if (mounted && data.url) setSignedUrl(data.url);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUrl();
    return () => { mounted = false; };
  }, [storageKey]);

  if (!signedUrl) return <div className="w-full h-full bg-gray-50 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-gray-300"/></div>;

  return <Image src={signedUrl} alt={alt} fill className="object-cover" />;
};

export default function SelfServeScopeList({ scopes, isConnected }: ScopeListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scopes]);

  // --- RENDERING HELPERS ---
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PAINT": return <Brush size={12} />;
      case "PREP": return <Hammer size={12} />;
      case "IMAGE": return <Camera size={12} />;
      case "QUESTION": return <HelpCircle size={12} />;
      default: return <DatabaseZap size={12} />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "PAINT": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PREP": return "bg-orange-100 text-orange-700 border-orange-200";
      case "IMAGE": return "bg-teal-100 text-teal-700 border-teal-200";
      case "QUESTION": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex justify-between items-end mb-3 px-1 shrink-0">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
          <CheckCircle2 size={12} className={isConnected ? "text-green-500" : "text-gray-300"} />
          Live Feed
        </div>
        <div className="text-[10px] text-gray-400 font-mono">{scopes.length} items</div>
      </div>
     
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1 pb-2">
        {scopes.length > 0 ? (
          scopes.map((scope, i) => (
            <div key={i} className={cn("bg-white rounded-lg p-3 border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300", scope.type === "QUESTION" ? "border-purple-200 bg-purple-50/50" : "border-gray-200")}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">{scope.area}</span>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 uppercase", getTypeStyles(scope.type))}>
                  {getTypeIcon(scope.type)} {scope.type}
                </span>
              </div>

              {scope.type === "IMAGE" && scope.image_path && (
                <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                  <SecureThumbnail storageKey={scope.image_path} alt={scope.area} />
                </div>
              )}

              {scope.type !== "IMAGE" && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 leading-tight">{scope.action}</span>
                  <span className="text-xs text-gray-500 mt-0.5">Target: {scope.item}</span>
                </div>
              )}

              <div className="text-[9px] text-gray-300 mt-2 font-mono text-right">
                {new Date(scope.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><MicOffIcon className="size-5 text-gray-400" /></div>
            <div><p className="text-xs font-bold text-gray-600">Room is Quiet</p></div>
          </div>
        )}
      </div>
    </div>
  );
}