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
        // REMOVE THIS LINE: await room.startAudio(); 
        
        // 1. Everyone enables Microphone
        await room.localParticipant.setMicrophoneEnabled(true);
        console.log("✅ Microphone active");

        // 2. Conditional Camera Logic
        if (!isPainter) {
          await room.localParticipant.setCameraEnabled(true, {
            resolution: VideoPresets.h720.resolution,
            facingMode: 'environment'
          });

          const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
          if (publication?.videoTrack) {
            publication.videoTrack.mediaStreamTrack.contentHint = 'detail';
          }
          console.log("✅ Homeowner HD Back-Camera active");
        } else {
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