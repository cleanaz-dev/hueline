// components/rooms/CameraHandler.tsx
'use client';

import { useEffect } from 'react';
import { useRoomContext } from '@/context/room-context';

export const CameraHandler = () => {
  const { room, isPainter } = useRoomContext();

  useEffect(() => {
    if (!room) return;

    // If I am the CLIENT, I should turn my camera on immediately 
    // so the painter can see the property.
    if (!isPainter) {
      const startCamera = async () => {
        try {
          await room.localParticipant.setCameraEnabled(true);
          await room.localParticipant.setMicrophoneEnabled(true);
          console.log("📸 Client camera started");
        } catch (e) {
          console.error("Failed to start camera:", e);
        }
      };
      startCamera();
    }
  }, [room, isPainter]);

  return null; // This component just handles side effects
};