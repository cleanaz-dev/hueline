"use client";

import { useEffect, useState } from "react";
import { TrackReferenceOrPlaceholder, useTrackVolume } from "@livekit/components-react";
import { LocalParticipant, RemoteParticipant, TrackPublication } from "livekit-client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AgentOrbProps {
  trackPublication?: TrackPublication;
  participant?: RemoteParticipant | LocalParticipant;
}

export const AgentOrb = ({ trackPublication, participant }: AgentOrbProps) => {
  // 1. Get real-time volume (0.0 to 1.0)
  // We attach a tiny FFT analyzer to the track
  const volume = useTrackVolume(trackPublication as any); // Type cast generic if needed
  
  // 2. Smooth out the volume for visual jitter reduction
  // If volume > 0.01, we consider the agent "speaking"
  const isSpeaking = volume > 0.02;

  // 3. Dynamic Scaling Calculation
  // Base scale is 1. Add the volume factor (amplified)
  const activeScale = 1 + (volume * 1.5); 

  if (!participant) return null;

  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      {/* --- LAYER 1: The Outer Glow (Reacts strongly) --- */}
      <motion.div
        className="absolute inset-0 rounded-full bg-violet-500/30 blur-md"
        animate={{
          scale: isSpeaking ? activeScale * 1.2 : [1, 1.1, 1], // Pulse if idle
          opacity: isSpeaking ? 0.8 : 0.3,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20, // Physics feel
          duration: isSpeaking ? 0.1 : 2, // Fast when talking, slow when idle
          repeat: isSpeaking ? 0 : Infinity,
        }}
      />

      {/* --- LAYER 2: The Core Wave (Reacts to volume) --- */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-violet-400 bg-violet-600/20"
        animate={{
          scale: isSpeaking ? activeScale : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      />

      {/* --- LAYER 3: The Center "Eye" --- */}
      <div className="relative z-10 w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-400 rounded-full shadow-inner flex items-center justify-center">
        {/* Optional: Icon inside, or just pure orb */}
        <Sparkles className="w-4 h-4 text-white/80" />
      </div>

      {/* --- STATE BADGE (Connecting vs Connected) --- */}
      <div className="absolute -bottom-1 -right-1">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-white"></span>
        </span>
      </div>
    </div>
  );
};