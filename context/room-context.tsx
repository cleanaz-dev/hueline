"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Room, RoomEvent, ConnectionState, Track } from "livekit-client";
import { LiveKitRoom } from "@livekit/components-react";
import {
  createClient,
  LiveClient,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { useOwner } from "@/context/owner-context";

// --- AudioWorklet Processor ---
const PCM_WORKLET_CODE = `
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const float32 = input[0];
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.port.postMessage(int16);
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

interface LaserPosition {
  x: number;
  y: number;
}
interface TranscriptItem {
  sender: "local" | "remote";
  text: string;
  timestamp: number;
}

interface RoomContextProps {
  room: Room | null;
  isConnecting: boolean;
  error: string | null;
  isPainter: boolean;
  laserPosition: LaserPosition | null;
  activeMockupUrl: string | null;
  isGenerating: boolean;
  isTranscribing: boolean;
  transcripts: TranscriptItem[];
  liveScopeItems: string[];
  toggleTranscription: () => void;
  sendData: (type: string, payload: any) => void;
  triggerAI: (slug: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextProps | undefined>(undefined);

interface RoomProviderProps {
  children: React.ReactNode;
  token: string;
  serverUrl: string;
  isPainter: boolean;
  subdomain?: string; // Optional since we use useOwner
}

export const RoomProvider = ({
  children,
  token,
  serverUrl,
  isPainter,
}: RoomProviderProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [laserPosition, setLaserPosition] = useState<LaserPosition | null>(
    null
  );
  const [activeMockupUrl, setActiveMockupUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [liveScopeItems, setLiveScopeItems] = useState<string[]>([]);

  const connectingRef = useRef(false);
  const deepgramLiveRef = useRef<LiveClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { subdomain } = useOwner();

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

  // --- 1. CONNECT TO LIVEKIT & PUBLISH MEDIA ---
  useEffect(() => {
    if (
      connectingRef.current ||
      (room && room.state !== ConnectionState.Disconnected)
    )
      return;

    const lkRoom = new Room({ adaptiveStream: true, dynacast: true });

    async function connect() {
      if (connectingRef.current) return;
      connectingRef.current = true;
      try {
        await lkRoom.connect(serverUrl, token);

        // FIX: Explicitly publish Camera & Microphone to the room
        console.log("🎙️ Publishing Media Tracks...");
        await lkRoom.localParticipant.enableCameraAndMicrophone();

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
            if (data.type === "TRANSCRIPT") {
              setTranscripts((prev) => [
                ...prev,
                { sender: "remote", text: data.text, timestamp: Date.now() },
              ]);
            }
            if (data.type === "SCOPE_UPDATE") {
              setLiveScopeItems((prev) => [...prev, data.item]);
            }
          } catch (err) {
            console.error("Data error", err);
          }
        });

        setRoom(lkRoom);
        setIsConnecting(false);
      } catch (e) {
        setIsConnecting(false);
        setError(e instanceof Error ? e.message : "Failed to connect");
      } finally {
        connectingRef.current = false;
      }
    }
    connect();
    return () => {
      if (lkRoom.state !== ConnectionState.Disconnected) lkRoom.disconnect();
    };
  }, [token, serverUrl]);

  // --- 2. AI INTELLIGENCE ---
  const handleChunkAnalysis = async (text: string) => {
    if (!isPainter) return;
    try {
      const currentSlug = subdomain?.slug;
      if (!currentSlug) return;

      fetch(`/api/subdomain/${currentSlug}/analyze-chunk`, {
        method: "POST",
        body: JSON.stringify({ text }),
      }).then(async (res) => {
        const data = await res.json();
        if (data.item) {
          setLiveScopeItems((prev) => [...prev, data.item]);
          sendData("SCOPE_UPDATE", { item: data.item });
        }
      });
    } catch (err) {
      console.error("Analysis Error", err);
    }
  };

  // --- 3. DEEPGRAM (Using Shared LiveKit Stream) ---
  const toggleTranscription = useCallback(async () => {
    if (isTranscribing) {
      deepgramLiveRef.current?.requestClose();
      audioContextRef.current?.close();
      deepgramLiveRef.current = null;
      audioContextRef.current = null;
      setIsTranscribing(false);
      return;
    }

    try {
      if (!room) throw new Error("Room not connected");
      setIsTranscribing(true);
      const currentSlug = subdomain?.slug;
      if (!currentSlug) throw new Error("No subdomain found");

      // A. Get Token
      const response = await fetch(
        `/api/subdomain/${currentSlug}/deepgram/token`
      );
      const data = await response.json();
      if (!data.key) throw new Error("Failed to get Deepgram key");

      // B. Init Deepgram
      const deepgram = createClient(data.key);
      const connection = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        encoding: "linear16",
        sample_rate: 16000,
        interim_results: true,
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (!transcript) return;

        if (data.is_final && transcript.length > 5) {
          setTranscripts((prev) => [
            ...prev,
            { sender: "local", text: transcript, timestamp: Date.now() },
          ]);
          sendData("TRANSCRIPT", { text: transcript });
          handleChunkAnalysis(transcript);
        }
      });

      connection.on(LiveTranscriptionEvents.Close, () =>
        setIsTranscribing(false)
      );
      await connection.keepAlive();
      deepgramLiveRef.current = connection;

      // C. GET AUDIO FROM LIVEKIT (FIXED)
      // Instead of getUserMedia(), we grab the track LiveKit is already using
      const micPublication = room.localParticipant.getTrackPublication(Track.Source.Microphone);
      
      if (!micPublication || !micPublication.track) {
         console.error("No microphone track found on LocalParticipant");
         alert("Please make sure your microphone is on (click the Mic button).");
         setIsTranscribing(false);
         return;
      }

      const localAudioTrack = micPublication.track;


      // Extract the raw MediaStream from the LiveKit track
      // @ts-ignore - LiveKit types can be strict, but the mediaStreamTrack exists on the track object
      const mediaStreamTrack = localAudioTrack.mediaStreamTrack;
      const stream = new MediaStream([mediaStreamTrack]);

      // D. Process Audio
      const audioContext = new window.AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;


      const blob = new Blob([PCM_WORKLET_CODE], {
        type: "application/javascript",
      });
      await audioContext.audioWorklet.addModule(URL.createObjectURL(blob));

      const source = audioContext.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioContext, "pcm-processor");

      worklet.port.onmessage = (e) => {
        if (deepgramLiveRef.current) deepgramLiveRef.current.send(e.data);
      };

      source.connect(worklet);
      worklet.connect(audioContext.destination);
    } catch (err) {
      console.error("Deepgram Start Error:", err);
      setIsTranscribing(false);
    }
  }, [isTranscribing, sendData, subdomain, isPainter, room]);

  useEffect(() => {
    return () => {
      deepgramLiveRef.current?.requestClose();
      audioContextRef.current?.close();
    };
  }, []);

  // --- 4. Replicate Image Gen (Existing) ---
  const triggerAI = async (slug: string) => {
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

  if (error) return <div className="text-white">Error: {error}</div>;

  return (
    <RoomContext.Provider
      value={{
        room,
        isConnecting,
        error,
        isPainter,
        laserPosition,
        activeMockupUrl,
        isGenerating,
        isTranscribing,
        transcripts,
        liveScopeItems,
        toggleTranscription,
        sendData,
        triggerAI,
      }}
    >
      {room ? (
        <LiveKitRoom room={room} token={token} serverUrl={serverUrl}>
          {children}
        </LiveKitRoom>
      ) : (
        <div className="h-screen bg-black text-white flex items-center justify-center">
          Loading Room...
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
