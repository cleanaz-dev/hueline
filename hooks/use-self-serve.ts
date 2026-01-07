import { useState, useEffect, useCallback, useRef } from "react";
import { useRoomContext } from "@/context/room-context";
import { useCameraEvents } from "@/hooks/use-camera-events";
import { 
  useTracks, 
  isTrackReference, 
  type TrackReference 
} from "@livekit/components-react";
import { Track, LocalVideoTrack } from "livekit-client"; 
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

  // --- EVENT LISTENER ---
  useEffect(() => {
    const eventSource = new EventSource(`/api/subdomain/${slug}/room/${roomId}/scope-stream`);
    
    eventSource.onopen = () => setIsStreamConnected(true);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
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
        } else if (Array.isArray(data)) {
          setScopes(prev => [...prev, ...data]);
        } else if (data.type) {
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

  // --- DEVICE CHECKS (Ensures Button Shows) ---
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";

    const checkDevices = async () => {
      try {
        // Enumerate devices to check if we should show the button
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoInputs.length > 1);
      } catch (e) { 
        console.error(e); 
      }
    };

    // 1. Run immediately
    checkDevices();
    
    // 2. Run AGAIN when permission is granted (localTrack appears)
    if (localTrack) {
      checkDevices();
    }

    // 3. Listen for hardware changes
    navigator.mediaDevices.addEventListener("devicechange", checkDevices);

    return () => { 
      document.body.style.overscrollBehavior = ""; 
      navigator.mediaDevices.removeEventListener("devicechange", checkDevices);
    };
  }, [localTrack]); 

  // --- ACTIONS ---
  const handleEndRoom = async () => {
    if (room) {
      await room.disconnect();
      window.location.href = `/`;
    }
  };

  const handleSwitchCamera = useCallback(async () => {
    // 1. Get the underlying LocalVideoTrack class
    const videoTrack = localTrack?.publication?.track as LocalVideoTrack | undefined;
    
    if (!videoTrack) return;

    try {
      // 2. Determine current facing mode
      const currentSettings = videoTrack.mediaStreamTrack.getSettings();
      // Default to 'user' (front) if undefined
      const currentFacingMode = currentSettings.facingMode || 'user';
      
      const nextFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      // 3. Use the correct public method: restartTrack
      await videoTrack.restartTrack({
        facingMode: nextFacingMode
      });
      
    } catch (error) {
      console.error("Failed to switch camera:", error);
    }
  }, [localTrack]); 

  return {
    room,
    localTrack,
    containerRef,
    laserPosition,
    activeMockupUrl,
    countdown,
    isCapturing,
    hasMultipleCameras,
    data: {
      scopes,
      isStreamConnected,
      lastCapture
    },
    uiState: { showEndDialog, showMobileMenu, showMobileScope },
    setUiState: { setShowEndDialog, setShowMobileMenu, setShowMobileScope, setLastCapture }, 
    actions: { handleEndRoom, handleSwitchCamera, dismissMockup: () => sendData("MOCKUP_READY", { url: null }) },
  };
};