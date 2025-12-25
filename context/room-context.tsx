"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Room, RoomEvent, RemoteParticipant, ConnectionState } from "livekit-client";
import { LiveKitRoom } from "@livekit/components-react";

interface LaserPosition {
  x: number;
  y: number;
}

interface RoomContextProps {
  room: Room | null;
  isConnecting: boolean;
  error: string | null;
  isPainter: boolean;
  laserPosition: LaserPosition | null;
  activeMockupUrl: string | null;
  isGenerating: boolean; // Added
  sendData: (type: string, payload: any) => void; // Standardized
  triggerAI: (slug: string) => Promise<void>; // Renamed and typed
}

const RoomContext = createContext<RoomContextProps | undefined>(undefined);

interface RoomProviderProps {
  children: React.ReactNode;
  token: string;
  serverUrl: string;
  isPainter: boolean;
  subdomain: string; // Added to fix the 'subdomain undefined' error
}

export const RoomProvider = ({
  children,
  token,
  serverUrl,
  isPainter,
  subdomain,
}: RoomProviderProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [laserPosition, setLaserPosition] = useState<LaserPosition | null>(null);
  const [activeMockupUrl, setActiveMockupUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Ref to prevent double-connection attempts in Dev Mode
  const connectingRef = useRef(false);

  useEffect(() => {
    // If we've already connected or are in the process, don't start again
    if (connectingRef.current || (room && room.state !== ConnectionState.Disconnected)) {
      return;
    }

    const lkRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    async function connect() {
      if (connectingRef.current) return;
      connectingRef.current = true;

      try {
        console.log("🛠️ Hue-Line: Connecting to room...");
        await lkRoom.connect(serverUrl, token);
        
        // Listen for Data
        lkRoom.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
          try {
            const data = JSON.parse(new TextDecoder().decode(payload));
            if (data.type === "POINTER") {
              setLaserPosition({ x: data.x, y: data.y });
              setTimeout(() => setLaserPosition(null), 2000);
            }
            if (data.type === "MOCKUP_READY") {
              setActiveMockupUrl(data.url);
              setIsGenerating(false);
            }
          } catch (err) {
            console.error("Data error", err);
          }
        });

        setRoom(lkRoom);
        setIsConnecting(false);
        console.log("✅ Hue-Line: Connection Established");
      } catch (e) {
        console.error("❌ Hue-Line: Connection Failed", e);
        setIsConnecting(false);
        setError(e instanceof Error ? e.message : "Failed to connect");
      } finally {
        connectingRef.current = false;
      }
    }

    connect();

    return () => {
      // In development, we might not want to disconnect immediately on 
      // every minor re-render, but for production, we clean up.
      if (lkRoom.state !== ConnectionState.Disconnected) {
        console.log("🔌 Hue-Line: Cleaning up connection");
        lkRoom.disconnect();
      }
    };
  }, [token, serverUrl]); // Room intentionally excluded from deps to prevent loops

  const sendData = useCallback(
    (type: string, payload: any) => {
      if (!room || !room.localParticipant) return;
      const data = new TextEncoder().encode(
        JSON.stringify({ type, ...payload })
      );
      room.localParticipant.publishData(data, { reliable: true });
    },
    [room]
  );

  const triggerAI = async (slug: string) => {
    // 1. Target the REMOTE video (not the local painter's camera)
    const videoElement =
      (document.querySelector(
        'video:not([data-lk-local="true"])'
      ) as HTMLVideoElement) || document.querySelector("video");

    if (!videoElement || isGenerating) return;

    setIsGenerating(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoElement, 0, 0);

    const imageBase64 = canvas.toDataURL("image/jpeg", 0.8);

    try {
      const response = await fetch(
        `/api/subdomain/${slug}/replicate/rooms-mockup`,
        {
          method: "POST",
          body: JSON.stringify({
            image: imageBase64,
            prompt:
              "freshly painted walls, sage green, highly detailed, professional photography",
          }),
        }
      );

      const result = await response.json();

      if (result.url) {
        sendData("MOCKUP_READY", { url: result.url });
        setActiveMockupUrl(result.url);
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      setIsGenerating(false);
    }
  };

if (error) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-red-500 font-bold text-2xl mb-4">Connection Failed</h1>
        <p className="text-zinc-500 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-white text-black px-6 py-2 rounded-full font-bold">Retry</button>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={{ room, isConnecting, error, isPainter, laserPosition, activeMockupUrl, isGenerating, sendData, triggerAI }}>
      {room ? (
        <LiveKitRoom room={room} token={token} serverUrl={serverUrl}>
          {children}
        </LiveKitRoom>
      ) : (
        <div className="h-screen bg-black flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 font-medium animate-pulse">Hue-Line is entering the room...</p>
        </div>
      )}
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context)
    throw new Error("useRoomContext must be used within a RoomProvider");
  return context;
};
