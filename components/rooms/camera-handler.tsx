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
       
        
        // This method does EVERYTHING: creates, enables, and publishes
        await room.localParticipant.enableCameraAndMicrophone();
        
        // Verify publication
        setTimeout(() => {
          const videoPubs = Array.from(room.localParticipant.videoTrackPublications.values());
          const audioPubs = Array.from(room.localParticipant.audioTrackPublications.values());
          
          videoPubs.forEach(pub => {
            console.log("  Video:", pub.trackSid, "isSubscribed:", pub.isSubscribed);
          });
        }, 1500);
        
      } catch (e) {
        console.error("❌ Mobile Media Error:", e);
        alert("Camera access failed. Please check permissions and try again.");
      }
    };

    const timeout = setTimeout(startMedia, 1000);
    return () => clearTimeout(timeout);
  }, [room, isPainter]);

  return null;
};