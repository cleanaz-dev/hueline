'use client';

import { useEffect, useRef } from 'react';
import { useRoomContext } from '@/context/room-context';
import { Track } from 'livekit-client';

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
            // Try back camera with hard-coded 1080p resolution
            await room.localParticipant.setCameraEnabled(true, {
              resolution: {
                width: 1920,
                height: 1080,
                frameRate: 30
              },
              facingMode: 'environment'
            });
            
            const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
            if (publication?.videoTrack) {
              publication.videoTrack.mediaStreamTrack.contentHint = 'detail';
              
              // Log actual resolution
              const settings = publication.videoTrack.mediaStreamTrack.getSettings();
              console.log("📸 CLIENT CAMERA RESOLUTION:", settings.width, "x", settings.height, "@", settings.frameRate, "fps");
            }
            console.log("✅ Client camera active");
          } catch (cameraError) {
            console.log("Camera not available (optional):", cameraError);
          }
        } else {
          try {
            await room.localParticipant.setCameraEnabled(true, {
              resolution: {
                width: 1920,
                height: 1080,
                frameRate: 30
              },
              facingMode: 'user'
            });
            
            const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
            if (publication?.videoTrack) {
              publication.videoTrack.mediaStreamTrack.contentHint = 'detail';
              
              // Log actual resolution
              const settings = publication.videoTrack.mediaStreamTrack.getSettings();
              console.log("📸 PAINTER CAMERA RESOLUTION:", settings.width, "x", settings.height, "@", settings.frameRate, "fps");
            }
            console.log("✅ Painter camera active");
          } catch (cameraError) {
            console.log("Painter camera not available (optional):", cameraError);
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