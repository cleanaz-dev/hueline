'use client';

import { useEffect, useRef } from 'react';
import { useRoomContext } from '@/context/room-context';

export const CameraHandler = () => {
  const { room, isPainter } = useRoomContext();
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Only run this for the client (homeowner)
    if (!room || isPainter || hasAttempted.current) return;

    const startMedia = async () => {
      hasAttempted.current = true;
      
      try {
        console.log("📱 Mobile: Attempting to unlock audio and camera...");
        
        // 1. Unlock Audio (Crucial for mobile)
        // This must happen to allow the client to hear the painter
        await room.startAudio();
        
        // 2. Enable Camera & Mic
        // This triggers the native "Allow Camera?" popup
        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);
        
        console.log("✅ Mobile: Media successfully started");
      } catch (e) {
        console.error("❌ Mobile Media Error:", e);
        // If it fails, it might be because the user hasn't clicked anything yet
        // or they denied permissions.
      }
    };

    // Small delay to ensure the WebSocket is stable
    const timeout = setTimeout(startMedia, 1000);
    return () => clearTimeout(timeout);
  }, [room, isPainter]);

  return null;
};