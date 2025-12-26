"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Room, RoomEvent, ConnectionState, DataPacket_Kind } from "livekit-client";
import { LiveKitRoom } from "@livekit/components-react";
import { createClient, LiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";

// --- 1. AudioWorklet Processor (Converts Mic Stream to Int16 for Deepgram) ---
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

// --- Interfaces ---
interface LaserPosition { x: number; y: number; }
interface TranscriptItem { sender: 'local' | 'remote'; text: string; timestamp: number; }

interface RoomContextProps {
  room: Room | null;
  isConnecting: boolean;
  error: string | null;
  isPainter: boolean; // Determines if you are the Host or Client
  
  // Shared State
  laserPosition: LaserPosition | null;
  activeMockupUrl: string | null;
  
  // Painter Only State
  isGenerating: boolean;
  isTranscribing: boolean;
  transcripts: TranscriptItem[];
  liveScopeItems: string[];

  // Actions
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
  slug: string;
}

export const RoomProvider = ({
  children,
  token,
  serverUrl,
  isPainter,
  slug
}: RoomProviderProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Shared State
  const [laserPosition, setLaserPosition] = useState<LaserPosition | null>(null);
  const [activeMockupUrl, setActiveMockupUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Audio/AI State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [liveScopeItems, setLiveScopeItems] = useState<string[]>([]);

  // Refs
  const deepgramLiveRef = useRef<LiveClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Helper: Send Data ---
  const sendData = useCallback(
    (type: string, payload: any) => {
      if (!room || !room.localParticipant) return;
      const strData = JSON.stringify({ type, ...payload });
      const data = new TextEncoder().encode(strData);
      
      // Use RELIABLE for images/transcripts, LOSSY for pointer
      const kind = type === "POINTER" ? DataPacket_Kind.LOSSY : DataPacket_Kind.RELIABLE;
      
      room.localParticipant.publishData(data, { reliable: kind === DataPacket_Kind.RELIABLE });
    },
    [room]
  );

  // --- 1. Connect & Listen ---
  useEffect(() => {
    // Prevent multiple connections
    if (room) return;

    const lkRoom = new Room({ adaptiveStream: true, dynacast: true });

    const connect = async () => {
      try {
        await lkRoom.connect(serverUrl, token);
        
        // --- DATA LISTENER (This is how they communicate) ---
        lkRoom.on(RoomEvent.DataReceived, (payload: Uint8Array, participant) => {
          try {
            const strData = new TextDecoder().decode(payload);
            const data = JSON.parse(strData);
            
            // 1. Pointer Updates
            if (data.type === "POINTER") {
              setLaserPosition({ x: data.x, y: data.y });
              // Clear pointer after 2 seconds of inactivity
              setTimeout(() => setLaserPosition(null), 2000);
            }
            // 2. Mockup Ready (Client sees this when Painter generates)
            if (data.type === "MOCKUP_READY") {
              setActiveMockupUrl(data.url);
              setIsGenerating(false);
            }
            // 3. Transcript
            if (data.type === "TRANSCRIPT") {
              setTranscripts(prev => [...prev, { sender: 'remote', text: data.text, timestamp: Date.now() }]);
            }
            // 4. Scope Updates
            if (data.type === "SCOPE_UPDATE") {
              setLiveScopeItems(prev => [...prev, data.item]);
            }
          } catch (err) {
            console.error("Failed to parse data message", err);
          }
        });

        setRoom(lkRoom);
        setIsConnecting(false);
      } catch (e) {
        setIsConnecting(false);
        setError(e instanceof Error ? e.message : "Failed to connect");
      }
    };

    connect();

    return () => {
      lkRoom.disconnect();
    };
  }, [token, serverUrl]); // Only re-run if token changes

  // --- 2. Transcription & AI Logic (Painter Only) ---
  const handleChunkAnalysis = async (text: string) => {
    if (!isPainter) return; 
    try {
      fetch(`/api/subdomain/${slug}/analyze-chunk`, {
        method: 'POST',
        body: JSON.stringify({ text })
      }).then(async (res) => {
        const data = await res.json();
        if (data.item) {
          setLiveScopeItems(prev => [...prev, data.item]);
          sendData('SCOPE_UPDATE', { item: data.item });
        }
      });
    } catch (err) { console.error("AI Error", err); }
  };

  const toggleTranscription = useCallback(async () => {
    if (isTranscribing) {
      deepgramLiveRef.current?.requestClose();
      audioContextRef.current?.close();
      setIsTranscribing(false);
      return;
    }

    try {
      setIsTranscribing(true);
      const res = await fetch(`/api/subdomain/${slug}/deepgram/token`);
      const data = await res.json();
      
      const deepgram = createClient(data.key);
      const connection = deepgram.listen.live({
        model: "nova-2", language: "en-US", smart_format: true,
        encoding: "linear16", sample_rate: 16000, interim_results: true,
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        if (data.is_final && transcript?.length > 0) {
          setTranscripts(prev => [...prev, { sender: 'local', text: transcript, timestamp: Date.now() }]);
          sendData("TRANSCRIPT", { text: transcript });
          handleChunkAnalysis(transcript);
        }
      });

      await connection.keepAlive();
      deepgramLiveRef.current = connection;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new window.AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      await audioContext.audioWorklet.addModule(URL.createObjectURL(new Blob([PCM_WORKLET_CODE], { type: "application/javascript" })));
      const source = audioContext.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioContext, 'pcm-processor');
      
      worklet.port.onmessage = (e) => deepgramLiveRef.current?.send(e.data);
      source.connect(worklet);
      worklet.connect(audioContext.destination);

    } catch (err) {
      console.error("Deepgram Error", err);
      setIsTranscribing(false);
    }
  }, [isTranscribing, sendData, slug, isPainter]);

  // --- 3. Replicate Image Gen ---
  const triggerAI = async (slug: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    // Grab video frame
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (!videoElement) { setIsGenerating(false); return; }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext("2d")?.drawImage(videoElement, 0, 0);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.7);

    try {
      const response = await fetch(`/api/subdomain/${slug}/replicate/rooms-mockup`, {
        method: "POST",
        body: JSON.stringify({ image: imageBase64, prompt: "modern interior design renovation" }),
      });
      const result = await response.json();
      
      if (result.url) {
        // Update Local
        setActiveMockupUrl(result.url);
        // Update Remote (Client)
        sendData("MOCKUP_READY", { url: result.url });
      }
    } catch (err) {
      console.error("Gen Error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <RoomContext.Provider value={{ 
      room, isConnecting, error, isPainter, 
      laserPosition, activeMockupUrl, isGenerating, 
      isTranscribing, transcripts, liveScopeItems,
      toggleTranscription, sendData, triggerAI 
    }}>
      {room && (
        <LiveKitRoom room={room} token={token} serverUrl={serverUrl} connect={false}>
          {children}
        </LiveKitRoom>
      )}
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoomContext must be used within RoomProvider");
  return ctx;
};