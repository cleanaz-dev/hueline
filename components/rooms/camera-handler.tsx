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
        // 1. Everyone enables Microphone (REQUIRED)
        await room.localParticipant.setMicrophoneEnabled(true);
        console.log("✅ Microphone active");

        // 2. Camera (OPTIONAL - only for non-painters/clients with cameras)
        if (!isPainter) {
          try {
            // Try back camera first
            await room.localParticipant.setCameraEnabled(true, {
              resolution: VideoPresets.h1080.resolution,
              facingMode: 'environment'
            });
            
            const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
            if (publication?.videoTrack) {
              publication.videoTrack.mediaStreamTrack.contentHint = 'detail';
            }
            console.log("✅ Client camera active");
          } catch (cameraError) {
            console.log("Camera not available (optional):", cameraError);
            // Don't fail - camera is optional
          }
        } else {
          // Painter: Try to enable camera but don't fail if unavailable
          try {
            await room.localParticipant.setCameraEnabled(true, {
              resolution: VideoPresets.h720.resolution
            });
            console.log("✅ Painter camera active");
          } catch (cameraError) {
            console.log("Painter camera not available (optional):", cameraError);
            // Don't fail - camera is optional for painter too
          }
        }
      } catch (e) {
        console.error("❌ Media Error:", e);
      }
    };

    startMedia();
  }, [room, isPainter]);

  return null;
};