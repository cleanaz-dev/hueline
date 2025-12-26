'use client';

import { useEffect, useRef } from 'react';
import { useRoomContext } from '@/context/room-context';

export const CameraHandler = () => {
  const { room, isPainter } = useRoomContext();
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!room || hasAttempted.current) return;

    const startMedia = async () => {
      hasAttempted.current = true;
      
      try {
        // 🔥 CRITICAL FOR MOBILE: Unlock audio first
        await room.startAudio(); 
        
        // If homeowner, start camera. If Painter, we just want to listen.
        if (!isPainter) {
          await room.localParticipant.setCameraEnabled(true);
          await room.localParticipant.setMicrophoneEnabled(true)
          console.log("✅ Homeowner camera published");
        } else {
          console.log("✅ Painter joined and audio unlocked");
        }
      } catch (e) {
        console.error("❌ Media Error:", e);
      }
    };

    startMedia();
  }, [room, isPainter]);

  return null;
};