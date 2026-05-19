"use client";

import { useState } from "react";
import { Mockup } from "@/app/generated/prisma";

interface DesignImageViewerProps {
  mockups: Mockup[];
  originalImageUrl: string;
  selectedMockup: Mockup | null;
  setSelectedMockup: (mockup: Mockup | null) => void;
}

export function DesignImageViewer({
  mockups,
  originalImageUrl,
  selectedMockup,
  setSelectedMockup,
}: DesignImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!mockups || mockups.length === 0) return null;

  return (
    // Fixed container: inset-x-0 centers it perfectly without transform hacks
    <div className="absolute bottom-6 inset-x-0 z-30 flex flex-col items-center justify-end pointer-events-none">
      
      <div className="flex flex-col items-center gap-6 pointer-events-auto">
        
        {/* EXPANDED SHELF (Always in DOM, controlled by CSS) */}
        <div
          className={`flex items-end gap-5 border-b-[3px] border-white/90 px-8 pb-4 pt-6 max-w-[95vw] overflow-x-auto scrollbar-hide origin-bottom transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isOpen 
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" 
              : "opacity-0 translate-y-12 scale-95 pointer-events-none"
            }
          `}
        >
          {/* Original Image Toggle */}
          <button
            onClick={() => setSelectedMockup(null)}
            className={`group relative h-40 w-56 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 ease-out
              ${selectedMockup === null 
                ? "border-4 border-white scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.4)] z-20" 
                : "border-[3px] border-white/50 scale-100 shadow-xl z-0 hover:z-10 hover:border-white hover:scale-[1.02]"
              }
            `}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={originalImageUrl} 
              alt="Original" 
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/50">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-white drop-shadow-md">ORIGINAL</span>
            </div>
          </button>

          {/* Minimal Separator */}
          <div className="h-24 w-px bg-white/40 mx-1 shrink-0 rounded-full" />

          {/* Generated Mockups */}
          {mockups.map((mockup) => {
            const isSelected = selectedMockup?.id === mockup.id;
            // @ts-ignore
            const hex = mockup.hex || mockup.colorHex || "#cccccc";
            
            return (
              <button
                key={mockup.id}
                onClick={() => setSelectedMockup(mockup)}
                className={`group relative h-40 w-56 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 ease-out
                  ${isSelected 
                    ? "border-4 border-white scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.4)] z-20" 
                    : "border-[3px] border-white/50 scale-100 shadow-xl z-0 hover:z-10 hover:border-white hover:scale-[1.02]"
                  }
                `}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={mockup.presignedUrl!} 
                  alt="Mockup" 
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                
                {/* Color Dot indicator */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div 
                    className="h-5 w-5 rounded-full border-[2px] border-white shadow-md" 
                    style={{ backgroundColor: hex }} 
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* MINIMAL TRIGGER PILL */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-3 rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-2xl backdrop-blur-md ring-1 ring-black/5 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
        >
          {/* Overlapping Color Dots */}
          <div className="flex -space-x-1.5">
            {mockups.slice(0, 3).map((m, i) => {
              // @ts-ignore
              const hex = m.hex || m.colorHex || "#ccc";
              return (
                <div 
                  key={m.id} 
                  className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: hex, zIndex: 10 - i }}
                />
              )
            })}
          </div>
          
          <span>{isOpen ? "Hide Mockups" : `${mockups.length} Mockups`}</span>
          
          <svg 
            className={`h-4 w-4 text-zinc-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-zinc-600 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>

      </div>
    </div>
  );
}