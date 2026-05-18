"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
      <motion.div layout className="flex flex-col items-center gap-6">
        
        {/* Expanded Shelf (No Background) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              // Border bottom creates the line, px-8 creates the overhang on the sides
              className="flex items-end gap-5 border-b-[3px] border-white/90 px-8 pb-4 pt-6 max-w-[95vw] overflow-x-auto scrollbar-hide"
            >
              {/* Original Image Toggle */}
              <button
                onClick={() => setSelectedMockup(null)}
                // Doubled in size: h-40 w-56, with thick white borders
                className={`group relative h-40 w-56 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 shadow-2xl ${
                  selectedMockup === null 
                    ? "border-4 border-white scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-10" 
                    : "border-[3px] border-white/60 opacity-60 hover:opacity-100 hover:border-white z-0 hover:z-10 hover:scale-105"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={originalImageUrl} 
                  alt="Original" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
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
                // @ts-ignore - Handle fallback color property
                const hex = mockup.hex || mockup.colorHex || "#cccccc";
                
                return (
                  <button
                    key={mockup.id}
                    onClick={() => setSelectedMockup(mockup)}
                    className={`group relative h-40 w-56 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 shadow-2xl ${
                      isSelected 
                        ? "border-4 border-white scale-105 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-10" 
                        : "border-[3px] border-white/60 opacity-60 hover:opacity-100 hover:border-white z-0 hover:z-10 hover:scale-105"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={mockup.presignedUrl!} 
                      alt="Mockup" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    {/* Gradient Overlay for Legibility */}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal Trigger Pill (Untouched, just updated shadow) */}
        <motion.button
          layout
          onClick={handleToggle}
          className="group flex items-center gap-3 rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-2xl backdrop-blur-md ring-1 ring-black/5 transition-all hover:bg-white hover:scale-105 active:scale-95"
        >
          {/* Overlapping Color Dots indicating generated versions */}
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
          
          <motion.svg 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            {/* Chevron Up */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </motion.svg>
        </motion.button>

      </motion.div>
    </div>
  );
}