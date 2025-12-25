// components/rooms/CameraHandler.tsx
'use client';

import { useEffect } from 'react';
import { useRoomContext } from '@/context/room-context';

export const CameraHandler = () => {
  const { room, isPainter } = useRoomContext();

  useEffect(() => {
  if (!room || isPainter) return;

  const initMobileMedia = async () => {
    try {
      // 1. Force audio playback permission
      await room.startAudio(); 
      
      // 2. Enable Camera
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (e) {
      alert("Please allow camera access to show the property.");
    }
  };

  initMobileMedia();
}, [room, isPainter]);

  return null; // This component just handles side effects
};