"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface RoomInteractionContextType {
  viewImage: (url: string) => void;
  closeImage: () => void;
}

const RoomInteractionContext = createContext<RoomInteractionContextType | null>(
  null
);

export function useRoomInteraction() {
  const context = useContext(RoomInteractionContext);
  if (!context)
    throw new Error(
      "useRoomInteraction must be used within RoomInteractionProvider"
    );
  return context;
}

export function RoomInteractionProvider({ children }: { children: ReactNode }) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const viewImage = (url: string) => setActiveImage(url);
  const closeImage = () => setActiveImage(null);

  return (
    <RoomInteractionContext.Provider value={{ viewImage, closeImage }}>
      {children}

      {/* --- FULL SCREEN VIEWER --- */}
      {activeImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeImage}
        >
          {/* Floating Close Button */}
          <button
            onClick={closeImage}
            className="absolute top-5 right-5 z-[110] p-3 bg-black/50 hover:bg-zinc-800 text-white rounded-full transition-all border border-white/10 backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div
            className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeImage}
              alt="Full view"
              width={1920}
              height={1080}
              className="w-auto h-auto max-w-full max-h-full object-contain"
              priority
              quality={100}
            />
          </div>
        </div>
      )}
    </RoomInteractionContext.Provider>
  );
}