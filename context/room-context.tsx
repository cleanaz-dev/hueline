"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Room, RoomEvent, ConnectionState } from "livekit-client";
import { LiveKitRoom } from "@livekit/components-react";
import { RealtimeTranscriber } from "assemblyai";

// --- 1. AudioWorklet Processor Code (Runs in a separate thread) ---
// We define this as a string to avoid needing separate file loaders in Next.js
const PCM_WORKLET_CODE = `
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // inputs[0] is the input channel (microphone)
    const input = inputs[0];
    if (input.length > 0) {
      const float32Data = input[0];
      const int16Data = new Int16Array(float32Data.length);
      
      // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
      for (let i = 0; i < float32Data.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Data[i]));
        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Send the Int16 buffer back to the main thread
      this.port.postMessage(int16Data);
    }
    return true; // Keep the processor alive
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
  isPainter: boolean;
  laserPosition: LaserPosition | null;
  activeMockupUrl: string | null;
  isGenerating: boolean;
  isTranscribing: boolean;
  transcripts: TranscriptItem[];
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
  subdomain: string;
}

export const RoomProvider = ({
  children,
  token,
  serverUrl,
  isPainter,
  subdomain,
}: RoomProviderProps) => {
  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [laserPosition, setLaserPosition] = useState<LaserPosition | null>(null);
  const [activeMockupUrl, setActiveMockupUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);

  // Refs for Cleanup
  const connectingRef = useRef(false);
  const transcriberRef = useRef<RealtimeTranscriber | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Helper: Send Data
  const sendData = useCallback(
    (type: string, payload: any) => {
      if (!room || !room.localParticipant) return;
      const data = new TextEncoder().encode(JSON.stringify({ type, ...payload }));
      room.localParticipant.publishData(data, { reliable: true });
    },
    [room]
  );

  // --- LiveKit Connection (Same as before) ---
  useEffect(() => {
    if (connectingRef.current || (room && room.state !== ConnectionState.Disconnected)) return;

    const lkRoom = new Room({ adaptiveStream: true, dynacast: true });

    async function connect() {
      if (connectingRef.current) return;
      connectingRef.current = true;
      try {
        await lkRoom.connect(serverUrl, token);
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
              setTranscripts(prev => [...prev, { sender: 'remote', text: data.text, timestamp: Date.now() }]);
            }
          } catch (err) { console.error("Data error", err); }
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
    return () => { if (lkRoom.state !== ConnectionState.Disconnected) lkRoom.disconnect(); };
  }, [token, serverUrl]);

  // --- Toggle Transcription (AudioWorklet Implementation) ---
  const toggleTranscription = useCallback(async () => {
    // STOP Logic
    if (isTranscribing) {
      transcriberRef.current?.close();
      audioContextRef.current?.close();
      streamRef.current?.getTracks().forEach(track => track.stop());
      
      transcriberRef.current = null;
      audioContextRef.current = null;
      workletNodeRef.current = null;
      streamRef.current = null;
      
      setIsTranscribing(false);
      return;
    }

    // START Logic
    try {
      setIsTranscribing(true);

      // 1. Get Token
      const response = await fetch('/api/assembly/token', { method: 'POST' });
      const data = await response.json();
      if (!data.token) throw new Error("Failed to get token");

      // 2. Setup AssemblyAI
      const transcriber = new RealtimeTranscriber({
        token: data.token,
        sampleRate: 16000,
      });

      transcriber.on('transcript', (transcript) => {
        if (!transcript.text || transcript.message_type !== 'FinalTranscript') return;
        setTranscripts(prev => [...prev, { sender: 'local', text: transcript.text, timestamp: Date.now() }]);
        sendData("TRANSCRIPT", { text: transcript.text });
      });

      transcriber.on('error', (err) => {
        console.error('AssemblyAI Error:', err);
        setIsTranscribing(false);
      });

      await transcriber.connect();

      // 3. Setup AudioWorklet (The Modern Way)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new window.AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // Load the Worklet from the string constant
      const blob = new Blob([PCM_WORKLET_CODE], { type: "application/javascript" });
      const workletUrl = URL.createObjectURL(blob);
      await audioContext.audioWorklet.addModule(workletUrl);

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');

      // Receive Int16 data from the worker thread
      workletNode.port.onmessage = (event) => {
        // Send raw buffer to AssemblyAI
        if (transcriber) transcriber.sendAudio(event.data.buffer);
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination); // Connect to dest to keep pipeline alive (usually muted automatically by worklet design if no output)

      workletNodeRef.current = workletNode;
      transcriberRef.current = transcriber;

    } catch (err) {
      console.error("Failed to start transcription:", err);
      setIsTranscribing(false);
    }
  }, [isTranscribing, sendData]);

  // Cleanup
  useEffect(() => {
    return () => {
      transcriberRef.current?.close();
      audioContextRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // --- AI Mockup Logic ---
  const triggerAI = async (slug: string) => {
    // ... (Your existing AI logic here)
    const videoElement = (document.querySelector('video:not([data-lk-local="true"])') as HTMLVideoElement) || document.querySelector("video");
    if (!videoElement || isGenerating) return;

    setIsGenerating(true);
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoElement, 0, 0);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.8);

    try {
      const response = await fetch(`/api/subdomain/${slug}/replicate/rooms-mockup`, {
        method: "POST",
        body: JSON.stringify({ image: imageBase64, prompt: "freshly painted walls, sage green, highly detailed, professional photography" }),
      });
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
    return (/* Error UI */ <div className="text-white">Error: {error}</div>);
  }

  return (
    <RoomContext.Provider value={{ 
      room, isConnecting, error, isPainter, laserPosition, activeMockupUrl, isGenerating, 
      isTranscribing, transcripts, toggleTranscription, sendData, triggerAI 
    }}>
      {room ? (
        <LiveKitRoom room={room} token={token} serverUrl={serverUrl}>
          {children}
        </LiveKitRoom>
      ) : (
        <div className="h-screen bg-black text-white flex items-center justify-center">Loading Room...</div>
      )}
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useRoomContext must be used within a RoomProvider");
  return context;
};