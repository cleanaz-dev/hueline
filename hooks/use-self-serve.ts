import { useState, useEffect, useCallback, useRef } from "react";
import { useRoomContext } from "@/context/room-context";
import { useCameraEvents } from "@/hooks/use-camera-events";
import {
  useTracks,
  isTrackReference,
  type TrackReference,
} from "@livekit/components-react";
import { Track, LocalVideoTrack, VideoPresets } from "livekit-client";
import { ScopeItem } from "@/components/rooms/stage/self-serve-room-list";

export const useSelfServe = (slug: string, roomId: string, huelineId: string) => {
  const { room, laserPosition, activeMockupUrl, sendData } = useRoomContext();
  const { countdown, isCapturing } = useCameraEvents(slug, roomId);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- DATA STATE ---
  const [scopes, setScopes] = useState<ScopeItem[]>([]);
  const [isStreamConnected, setIsStreamConnected] = useState(false);
  const [lastCapture, setLastCapture] = useState<{
    path: string;
    area: string;
  } | null>(null);

  // --- UI STATE ---
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileScope, setShowMobileScope] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // --- TRACK LOGIC ---
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);
  const localTrack = tracks.find(
    (t) => t.participant.isLocal && isTrackReference(t)
  ) as TrackReference | undefined;


  // --- ACTIONS ---
  const handleEndRoom = useCallback(async () => {
    console.log("🛑 END SIGNAL RECEIVED. CLOSING ROOM.");
    if (room) {
      await room.disconnect();
    }
    window.location.href = `booking/${huelineId}/room/${roomId}/post-session`;
  }, [room]);

  // --- EVENT LISTENER ---
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/subdomain/${slug}/room/${roomId}/scope-stream`
    );

    eventSource.onopen = () => setIsStreamConnected(true);

    eventSource.onmessage = async (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const data = parsed.data;

        // 1. Handle Arrays
        if (Array.isArray(data)) {
          const endEvent = data.find((item) => item.type === "END");
          if (endEvent) {
            console.log("🛑 END signal found in array!");
            eventSource.close();
            await handleEndRoom();
            return;
          }

          const scopeItems = data.filter((item) => item.type !== "END");
          setScopes((prev) => [...prev, ...scopeItems]);
          return;
        }

        // 2. CHECK FOR END SIGNAL (single event)
        if (data.type === "END") {
          console.log("🛑 END signal received!");
          eventSource.close();
          await handleEndRoom();
          return;
        }

        // 4. Handle Photos & DROP RESOLUTION
        if (data.event === "photo_capture_complete") {
          const newItem: ScopeItem = {
            type: "IMAGE",
            area: data.data.area,
            item: "Snapshot",
            action: "Visual Capture",
            timestamp: new Date().toISOString(),
            image_path: data.data.image_path,
          };
          setScopes((prev) => [...prev, newItem]);
          setLastCapture({ path: data.data.image_path, area: data.data.area });
          
          return;
        }

        // 5. Handle Standard Scope Items
        if (data.type) {
          setScopes((prev) => [...prev, data]);
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
  }, [slug, roomId]); // ⭐ REMOVED: handleEndRoom, boostResolution, dropResolution

  // --- DEVICE CHECKS (Ensures Button Shows) ---
  useEffect(() => {
    document.body.style.overscrollBehavior = "none";

    const checkDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoInputs.length > 1);
      } catch (e) {
        console.error(e);
      }
    };

    checkDevices();

    if (localTrack) {
      checkDevices();
    }

    navigator.mediaDevices.addEventListener("devicechange", checkDevices);

    return () => {
      document.body.style.overscrollBehavior = "";
      navigator.mediaDevices.removeEventListener("devicechange", checkDevices);
    };
  }, [localTrack]);

  const handleSwitchCamera = useCallback(async () => {
    const videoTrack = localTrack?.publication?.track as
      | LocalVideoTrack
      | undefined;
    if (!videoTrack) return;

    try {
      const currentSettings = videoTrack.mediaStreamTrack.getSettings();
      const currentFacingMode = currentSettings.facingMode || "user";
      const nextFacingMode =
        currentFacingMode === "user" ? "environment" : "user";

      await videoTrack.restartTrack({
        facingMode: nextFacingMode,
        resolution: VideoPresets.h1080.resolution
      });

      const newSettings = videoTrack.mediaStreamTrack.getSettings();
      console.log("📸 Camera switched:", nextFacingMode, newSettings.width, "x", newSettings.height);
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
      lastCapture,
    },
    uiState: { showEndDialog, showMobileMenu, showMobileScope },
    setUiState: {
      setShowEndDialog,
      setShowMobileMenu,
      setShowMobileScope,
      setLastCapture,
    },
    actions: {
      handleEndRoom,
      handleSwitchCamera,
      dismissMockup: () => sendData("MOCKUP_READY", { url: null }),
    },
  };
};