import { useState, useEffect, useCallback, useRef } from "react";
import { useRoomContext } from "@/context/room-context";
import { useCameraEvents } from "@/hooks/use-camera-events";
import { useTracks, isTrackReference, type TrackReference } from "@livekit/components-react";
import { Track } from "livekit-client";
import { ScopeItem } from "@/components/rooms/stage/self-serve-room-list";

export const useSelfServe = (slug: string, roomId: string) => {
  const { room, laserPosition, activeMockupUrl, sendData } = useRoomContext();
  const { countdown, isCapturing } = useCameraEvents(slug, roomId);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- DATA STATE ---
  const [scopes, setScopes] = useState<ScopeItem[]>([]);
  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const [lastCapture, setLastCapture] = useState<{ path: string; area: string } | null>(null);

  // --- UI STATE ---
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileScope, setShowMobileScope] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // --- TRACK LOGIC ---
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const localTrack = tracks.find((t) => t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;

  // --- EVENT LISTENER (THE BRAIN) ---
  useEffect(() => {
    const eventSource = new EventSource(`/api/subdomain/${slug}/room/${roomId}/scope-stream`);
    
    eventSource.onopen = () => setIsStreamConnected(true);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 1. Handle Photo Capture (Flash Trigger)
        if (data.event === 'photo_capture_complete') {
          const newItem: ScopeItem = {
            type: "IMAGE",
            area: data.data.area,
            item: "Snapshot",
            action: "Visual Capture",
            timestamp: new Date().toISOString(),
            image_path: data.data.image_path
          };
          
          setScopes(prev => [...prev, newItem]);
          setLastCapture({ path: data.data.image_path, area: data.data.area });
        }
        // 2. Handle Regular Scope Items
        else if (Array.isArray(data)) {
          setScopes(prev => [...prev, ...data]);
        } 
        else if (data.type) {
          setScopes(prev => [...prev, data]);
        }
      } catch (e) {
        console.error("Parse error", e);
      }
    };

    eventSource.onerror = () => {
      setIsStreamConnected(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [slug, roomId]);

  // --- DEVICE CHECKS ---
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";
    const checkDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasMultipleCameras(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch (e) { console.error(e); }
    };
    checkDevices();
    return () => { document.body.style.overscrollBehavior = ""; };
  }, []);

  // --- ACTIONS ---
  const handleEndRoom = async () => {
    if (room) {
      await room.disconnect();
      window.location.href = `/`;
    }
  };

  const handleSwitchCamera = useCallback(async () => {
    if (!room) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      if (videoDevices.length < 2) return;
      const currentDeviceId = room.getActiveDevice("videoinput");
      const nextIndex = (videoDevices.findIndex(d => d.deviceId === currentDeviceId) + 1) % videoDevices.length;
      await room.switchActiveDevice("videoinput", videoDevices[nextIndex].deviceId);
    } catch (error) { console.error(error); }
  }, [room]);

  return {
    room,
    localTrack,
    containerRef,
    laserPosition,
    activeMockupUrl,
    countdown,
    isCapturing,
    hasMultipleCameras,
    // Data Props
    data: {
      scopes,
      isStreamConnected,
      lastCapture
    },
    // UI Props
    uiState: { showEndDialog, showMobileMenu, showMobileScope },
    setUiState: { setShowEndDialog, setShowMobileMenu, setShowMobileScope, setLastCapture }, // Expose setLastCapture to clear it
    actions: { handleEndRoom, handleSwitchCamera, dismissMockup: () => sendData("MOCKUP_READY", { url: null }) },
  };
};