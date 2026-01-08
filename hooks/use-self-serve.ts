import { useState, useEffect, useCallback, useRef } from "react";
import { useRoomContext } from "@/context/room-context";
import { useCameraEvents } from "@/hooks/use-camera-events";
import { useTracks, isTrackReference, type TrackReference } from "@livekit/components-react";
import { Track, LocalVideoTrack } from "livekit-client"; 
import { ScopeItem } from "@/components/rooms/stage/self-serve-room-list";

export const useSelfServe = (slug: string, roomId: string) => {
  const { room, laserPosition, activeMockupUrl, sendData } = useRoomContext();
  const { countdown, isCapturing } = useCameraEvents(slug, roomId);
  const containerRef = useRef<HTMLDivElement>(null);

  const [scopes, setScopes] = useState<ScopeItem[]>([]);
  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const [lastCapture, setLastCapture] = useState<{ path: string; area: string } | null>(null);

  // UI State
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileScope, setShowMobileScope] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const localTrack = tracks.find((t) => t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;

  // --- ACTIONS ---
  const handleEndRoom = useCallback(async () => {
    console.log("🛑 END SIGNAL RECEIVED. CLOSING ROOM.");
    if (room) await room.disconnect();
    window.location.href = `/post-session`; 
  }, [room]);

  // --- EVENT LISTENER ---
  useEffect(() => {
    const eventSource = new EventSource(`/api/subdomain/${slug}/room/${roomId}/scope-stream`);
    
    eventSource.onopen = () => setIsStreamConnected(true);
    
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // --- 1. THE FIX: Handle both Array and Object ---
        // If it's an array (history), we look inside it. If it's an object (new event), we wrap it.
        const items = Array.isArray(data) ? data : [data];

        // Check if ANY item in this batch is the END signal
        const hasEndSignal = items.some((i: any) => i.type === "END");

        if (hasEndSignal) {
          eventSource.close();
          await handleEndRoom();
          return;
        }

        // --- 2. Process Data for UI ---
        if (Array.isArray(data)) {
          // Add history to list
          setScopes(prev => [...prev, ...data]);
        } 
        else if (data.event === 'photo_capture_complete') {
          // Handle Photo
          setScopes(prev => [...prev, {
            type: "IMAGE",
            area: data.data.area,
            item: "Snapshot",
            action: "Visual Capture",
            timestamp: new Date().toISOString(),
            image_path: data.data.image_path
          }]);
          setLastCapture({ path: data.data.image_path, area: data.data.area });
        } 
        else if (data.type) {
          // Handle Standard Item
          setScopes(prev => [...prev, data]);
        }
      } catch (e) {
        console.error("Stream parse error", e);
      }
    };

    eventSource.onerror = () => {
      setIsStreamConnected(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [slug, roomId, handleEndRoom]);

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
    if (localTrack) checkDevices();
    navigator.mediaDevices.addEventListener("devicechange", checkDevices);
    return () => { 
      document.body.style.overscrollBehavior = ""; 
      navigator.mediaDevices.removeEventListener("devicechange", checkDevices);
    };
  }, [localTrack]); 

  // --- CAMERA SWITCH ---
  const handleSwitchCamera = useCallback(async () => {
    const videoTrack = localTrack?.publication?.track as LocalVideoTrack | undefined;
    if (!videoTrack) return;

    try {
      const current = videoTrack.mediaStreamTrack.getSettings().facingMode || 'user';
      await videoTrack.restartTrack({ facingMode: current === 'user' ? 'environment' : 'user' });
    } catch (e) { console.error(e); }
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
    data: { scopes, isStreamConnected, lastCapture },
    uiState: { showEndDialog, showMobileMenu, showMobileScope },
    setUiState: { setShowEndDialog, setShowMobileMenu, setShowMobileScope, setLastCapture }, 
    actions: { handleEndRoom, handleSwitchCamera, dismissMockup: () => sendData("MOCKUP_READY", { url: null }) },
  };
};