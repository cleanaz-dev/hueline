// hooks/use-camera-events.ts
import { useState, useEffect } from 'react';

export interface CameraEvent {
  event: 'photo_countdown_start' | 'photo_countdown_tick' | 'photo_capture_now' | 'photo_capture_complete' | 'photo_capture_error';
  data?: {
    countdown?: number;
    count?: number;
    image_url?: string;
    error?: string;
  };
}

export function useCameraEvents(slug: string, roomId: string) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapturedUrl, setLastCapturedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/subdomain/${slug}/room/${roomId}/scope-stream`
    );
    
    eventSource.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        
        if (type === 'event') {
          const { event: eventName, data: eventData } = data;
          
          switch (eventName) {
            case 'photo_countdown_start':
              setCountdown(eventData.countdown);
              setIsCapturing(true);
              setError(null);
              break;
              
            case 'photo_countdown_tick':
              setCountdown(eventData.count);
              break;
              
            case 'photo_capture_now':
              setCountdown(0);
              break;
              
            case 'photo_capture_complete':
              setIsCapturing(false);
              setCountdown(null);
              setLastCapturedUrl(eventData.image_url);
              break;
              
            case 'photo_capture_error':
              setIsCapturing(false);
              setCountdown(null);
              setError(eventData.error);
              break;
          }
        }
      } catch (e) {
        console.error("Error parsing camera event", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [slug, roomId]);

  return { countdown, isCapturing, lastCapturedUrl, error };
}