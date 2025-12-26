'use client';

import { useEffect, useRef } from 'react';
import { useRoomContext } from '@/context/room-context';
import { VideoPresets, Track } from 'livekit-client';

export const CameraHandler = () => {
  const { room, isPainter } = useRoomContext();
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!room || hasAttempted.current) return;

    const startMedia = async () => {
      hasAttempted.current = true;
      
      try {
        // 1. Unlock Audio Context
        await room.startAudio(); 
        
        // 2. Everyone enables Microphone
        await room.localParticipant.setMicrophoneEnabled(true);
        console.log("✅ Microphone active");

        // 3. Conditional Camera Logic
        if (!isPainter) {
          // Homeowner: High Def Back Camera
          await room.localParticipant.setCameraEnabled(true, {
            resolution: VideoPresets.h720.resolution,
            facingMode: 'environment' // Use the back camera
          });

          // Optimization for walls/detail
          const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
          if (publication?.videoTrack) {
            publication.videoTrack.mediaStreamTrack.contentHint = 'detail';
          }
          console.log("✅ Homeowner HD Back-Camera active");
        } else {
          // Painter: Desktop usually uses front camera (optional)
          await room.localParticipant.setCameraEnabled(true, {
            resolution: VideoPresets.h720.resolution
          });
          console.log("✅ Painter Camera active");
        }
      } catch (e) {
        console.error("❌ Media Error:", e);
      }
    };

    startMedia();
  }, [room, isPainter]);

  return null;
};