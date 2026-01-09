'use client';

import { useEffect, useRef } from 'react';
import { useRoomContext } from '@/context/room-context';
import { VideoPresets, Track } from 'livekit-client';
import axios from 'axios';

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
              
              // 🔍 GET THE ACTUAL RESOLUTION BEING PUBLISHED
              const settings = publication.videoTrack.mediaStreamTrack.getSettings();
              
              // 📤 SEND TO WEBHOOK
              await axios.post('https://webhook.site/812ea7fe-4d66-4f6e-be66-5ae620631c72', {
                type: 'CLIENT_CAMERA',
                width: settings.width,
                height: settings.height,
                frameRate: settings.frameRate,
                facingMode: settings.facingMode,
                deviceId: settings.deviceId,
                timestamp: new Date().toISOString()
              }).catch(e => console.error('Webhook failed:', e));
              
              console.log("📸 PUBLISHING VIDEO AT:", settings.width, "x", settings.height);
            }
            console.log("✅ Client camera active");
          } catch (cameraError) {
            console.log("Camera not available (optional):", cameraError);
          }
        } else {
          try {
            await room.localParticipant.setCameraEnabled(true, {
              resolution: VideoPresets.h1080.resolution
            });
            
            const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
            if (publication?.videoTrack) {
              // 🔍 GET THE ACTUAL RESOLUTION BEING PUBLISHED
              const settings = publication.videoTrack.mediaStreamTrack.getSettings();
              
              // 📤 SEND TO WEBHOOK
              await axios.post('https://webhook.site/812ea7fe-4d66-4f6e-be66-5ae620631c72', {
                type: 'PAINTER_CAMERA',
                width: settings.width,
                height: settings.height,
                frameRate: settings.frameRate,
                facingMode: settings.facingMode,
                deviceId: settings.deviceId,
                timestamp: new Date().toISOString()
              }).catch(e => console.error('Webhook failed:', e));
              
              console.log("📸 PUBLISHING VIDEO AT:", settings.width, "x", settings.height);
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