// useSelfServe.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useRoomContext } from "@/context/room-context";
import { useCameraEvents } from "@/hooks/use-camera-events";
import {
  useTracks,
  isTrackReference,
  type TrackReference,
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
  const [lastCapture, setLastCapture] = useState<{
    path: string;
    area: string;
  } | null>(null);

  // --- UI STATE ---
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileScope, setShowMobileScope] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isBoostingResolution, setIsBoostingResolution] = useState(false);

  // --- TRACK LOGIC ---
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);
  const localTrack = tracks.find(
    (t) => t.participant.isLocal && isTrackReference(t)
  ) as TrackReference | undefined;

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ RESOLUTION MANAGEMENT                                           │
  // │ These callbacks UPDATE when localTrack changes (that's correct!)│
  // └─────────────────────────────────────────────────────────────────┘
  
  const boostResolution = useCallback(async () => {
    const videoTrack = localTrack?.publication?.track as LocalVideoTrack | undefined;
    if (!videoTrack || isBoostingResolution) return;

    const currentSettings = videoTrack.mediaStreamTrack.getSettings();
    const currentFacingMode = (currentSettings.facingMode || "user") as "user" | "environment";
    
    try {
      setIsBoostingResolution(true);
      console.log("📸 Boosting to 4K for snapshot...");
      
      await videoTrack.restartTrack({
        facingMode: currentFacingMode,
        resolution: {
          width: 3840,
          height: 2160,
          frameRate: 30
        }
      });
      
      const newSettings = videoTrack.mediaStreamTrack.getSettings();
      console.log("✅ Resolution boosted:", newSettings.width, "x", newSettings.height);
    } catch (error) {
      console.error("Failed to boost resolution:", error);
      setIsBoostingResolution(false);
    }
  }, [localTrack, isBoostingResolution]); // ✅ These dependencies are CORRECT

  const dropResolution = useCallback(async () => {
    const videoTrack = localTrack?.publication?.track as LocalVideoTrack | undefined;
    if (!videoTrack) return;

    const currentSettings = videoTrack.mediaStreamTrack.getSettings();
    const currentFacingMode = (currentSettings.facingMode || "user") as "user" | "environment";

    try {
      console.log("📉 Dropping back to 1080p...");
      
      await videoTrack.restartTrack({
        facingMode: currentFacingMode,
        resolution: {
          width: 1920,
          height: 1080,
          frameRate: 30
        }
      });
      
      const newSettings = videoTrack.mediaStreamTrack.getSettings();
      console.log("✅ Back to streaming resolution:", newSettings.width, "x", newSettings.height);
      setIsBoostingResolution(false);
    } catch (error) {
      console.error("Failed to drop resolution:", error);
    }
  }, [localTrack]); // ✅ This dependency is CORRECT

  // --- ACTIONS ---
  const handleEndRoom = useCallback(async () => {
    console.log("🛑 END SIGNAL RECEIVED. CLOSING ROOM.");
    if (room) {
      await room.disconnect();
    }
    window.location.href = `/post-session`;
  }, [room]); // ✅ This dependency is CORRECT

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ EVENT SOURCE CONNECTION                                         │
  // │ KEY FIX: Only depends on [slug, roomId]                         │
  // │ Even though it USES boostResolution/dropResolution/handleEndRoom│
  // │ it doesn't need them in dependencies because JavaScript closures│
  // │ will always reference the LATEST version of these functions     │
  // └─────────────────────────────────────────────────────────────────┘
  
  useEffect(() => {
    console.log("🔌 Creating EventSource connection for room:", roomId);
    
    const eventSource = new EventSource(
      `/api/subdomain/${slug}/room/${roomId}/scope-stream`
    );

    eventSource.onopen = () => {
      console.log("✅ EventSource connected");
      setIsStreamConnected(true);
    };

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
            await handleEndRoom(); // ⭐ Uses LATEST handleEndRoom via closure
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
          await handleEndRoom(); // ⭐ Uses LATEST handleEndRoom via closure
          return;
        }

        // 3. BOOST RESOLUTION ON COUNTDOWN START
        if (data.event === "photo_countdown_start") {
          console.log("⏰ Countdown started - boosting resolution");
          await boostResolution(); // ⭐ Uses LATEST boostResolution via closure
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
          
          // DROP RESOLUTION BACK
          console.log("✅ Capture complete - dropping resolution");
          await dropResolution(); // ⭐ Uses LATEST dropResolution via closure
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
      console.log("❌ EventSource error");
      setIsStreamConnected(false);
      eventSource.close();
    };

    return () => {
      console.log("🔌 Closing EventSource connection");
      eventSource.close();
    };
  }, [slug, roomId]); 
  // ⭐⭐⭐ THE FIX: Only [slug, roomId] here!
  // NOT [slug, roomId, handleEndRoom, boostResolution, dropResolution]
  // 
  // WHY THIS WORKS:
  // - EventSource only recreates when slug/roomId changes (almost never)
  // - When boostResolution/dropResolution/handleEndRoom update (from localTrack changing),
  //   the eventSource.onmessage closure ALREADY has access to the new versions
  // - No need to tear down and recreate the entire connection
  //
  // THE FLOW:
  // 1. Redis publishes: photo_countdown_start
  // 2. EventSource receives it
  // 3. Calls boostResolution() → switches to 4K
  // 4. Redis publishes: photo_capture_complete  
  // 5. EventSource receives it
  // 6. Calls dropResolution() → switches back to 1080p
  // 7. EventSource stays connected throughout! ✅

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
        resolution: {
          width: 1920,
          height: 1080,
          frameRate: 30,
        },
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