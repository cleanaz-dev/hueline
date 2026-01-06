"use client";

import { useEffect, useState, useRef } from "react";
import {
  DatabaseZap,
  MicOffIcon,
  PaintRoller,
  Hammer,
  Brush,
  CheckCircle2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// --- NEW DATA SHAPE ---
interface ScopeItem {
  type: "PREP" | "PAINT" | "NOTE" | string;
  area: string;
  item: string;
  action: string;
  timestamp: string;
  image_url?: string | null;
}

interface ScopeListProps {
  slug: string;
  roomId: string;
}

export default function ScopeList({ slug, roomId }: ScopeListProps) {
  const [scopes, setScopes] = useState<ScopeItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [thumbnailPopup, setThumbnailPopup] = useState<{
    show: boolean;
    imageUrl: string;
    area: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new items arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scopes]);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/subdomain/${slug}/room/${roomId}/scope-stream`
    );
   
    eventSource.onopen = () => {
      console.log('✅ Connected to scope updates');
      setIsConnected(true);
    };
   
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if this is a photo_capture_complete event
        if (data.event === 'photo_capture_complete') {
          // Show thumbnail popup
          setThumbnailPopup({
            show: true,
            imageUrl: data.data.image_url,
            area: data.data.area
          });
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setThumbnailPopup(null);
          }, 5000);
        }
        // Handle regular scope items
        else if (Array.isArray(data)) {
          setScopes(prev => [...prev, ...data]);
        } else if (data.type) {
          // Regular scope item
          setScopes(prev => [...prev, data]);
        }
      } catch (e) {
        console.error("Error parsing scope item", e);
      }
    };

    eventSource.onerror = (error) => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [slug, roomId]);

  // Helper to render icon based on Type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PAINT": return <Brush size={12} />;
      case "PREP": return <Hammer size={12} />;
      case "NOTE": return <DatabaseZap size={12} />;
      default: return <DatabaseZap size={12} />;
    }
  };

  // Helper for colors
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "PAINT": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PREP": return "bg-orange-100 text-orange-700 border-orange-200";
      case "NOTE": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Thumbnail Popup */}
      {thumbnailPopup?.show && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Photo Captured</h3>
                <p className="text-blue-100 text-sm capitalize">{thumbnailPopup.area}</p>
              </div>
              <button
                onClick={() => setThumbnailPopup(null)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Image */}
            <div className="relative aspect-video bg-gray-100">
              <Image
                src={thumbnailPopup.imageUrl}
                alt={`${thumbnailPopup.area} snapshot`}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-gray-50 text-center">
              <p className="text-xs text-gray-500">Tap outside to close</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-3 px-1 shrink-0">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
          <CheckCircle2 size={12} className={isConnected ? "text-green-500" : "text-gray-300"} />
          Live Intel
        </div>
        <div className="text-[10px] text-gray-400 font-mono">{scopes.length} items</div>
      </div>
     
      {/* List Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1 pb-2">
        {scopes.length > 0 ? (
          scopes.map((scope, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 group hover:border-blue-300 transition-colors"
            >
              {/* Header: Area & Type */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  {scope.area}
                </span>
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 uppercase",
                  getTypeStyles(scope.type)
                )}>
                  {getTypeIcon(scope.type)}
                  {scope.type}
                </span>
              </div>

              {/* Image Thumbnail (if exists) */}
              {scope.image_url && (
                <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden">
                  <Image
                    src={scope.image_url}
                    alt={`${scope.area} reference`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Body: Action & Item */}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800 leading-tight">
                  {scope.action}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  Target: {scope.item}
                </span>
              </div>

              {/* Footer: Time */}
              <div className="text-[9px] text-gray-300 mt-2 font-mono text-right group-hover:text-gray-400 transition-colors">
                {new Date(scope.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          ))
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-center space-y-3 opacity-50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <MicOffIcon className="size-5 text-gray-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600">No data captured</p>
              <p className="text-[10px] text-gray-400">Start talking to populate scope</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

