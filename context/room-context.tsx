"use client";

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  useMemo 
} from "react";
import { 
  Room, 
  RoomEvent, 
  DataPacket_Kind, 
  RemoteParticipant, 
  Participant
} from "livekit-client";
import { LiveKitRoom } from "@livekit/components-react";
import { createClient, LiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";

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

// --- Interfaces ---
interface LaserPosition { x: number; y: number; }
interface TranscriptItem { sender: 'local' | 'remote'; text: string; timestamp: number; }

interface RoomContextProps {
  room: Room;
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
  slug: string;
}

export const RoomProvider = ({
  children,
  token,
  serverUrl,
  isPainter,
  slug
}: RoomProviderProps) => {
  
  // 1. Initialize Room (Singleton)
  const room = useMemo(() => {
    return new Room({ 
      adaptiveStream: true, 
      dynacast: true,
      publishDefaults: { simulcast: true }
    });
  }, []);

  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [laserPosition, setLaserPosition] = useState<LaserPosition | null>(null);
  const [activeMockupUrl, setActiveMockupUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [liveScopeItems, setLiveScopeItems] = useState<string[]>([]);

  const deepgramLiveRef = useRef<LiveClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Send Data Helper ---
  const sendData = useCallback(
    (type: string, payload: any) => {
      if (room.state !== 'connected' || !room.localParticipant) {
        console.warn("⚠️ Cannot send data - room not ready");
        return;
      }
      const strData = JSON.stringify({ type, ...payload });
      const data = new TextEncoder().encode(strData);
      const kind = type === "POINTER" ? DataPacket_Kind.LOSSY : DataPacket_Kind.RELIABLE;
      room.localParticipant.publishData(data, { reliable: kind === DataPacket_Kind.RELIABLE });
    },
    [room]
  );

  // --- Event Listeners (Logs Restored) ---
  useEffect(() => {
    const handleConnected = () => {
      console.log("✅ Room Connected!", {
        name: room.name,
        participants: room.remoteParticipants.size
      });
      setIsConnecting(false);
    };

    const handleDisconnected = () => {
      console.log("❌ Room Disconnected");
      setIsConnecting(false);
    };

    // 👇 RESTORED: Participant Logs
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log("👤 Participant Joined:", participant.identity);
    };

    const handleParticipantDisconnected = (participant: RemoteParticipant) => {
      console.log("👋 Participant Left:", participant.identity);
    };

    const handleDataReceived = (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const strData = new TextDecoder().decode(payload);
        const data = JSON.parse(strData);
        // console.log("📥 Data:", data.type); // Uncomment to debug data flow

        if (data.type === "POINTER") {
          setLaserPosition({ x: data.x, y: data.y });
          setTimeout(() => setLaserPosition(null), 2000);
        }
        if (data.type === "MOCKUP_READY") {
          setActiveMockupUrl(data.url);
          setIsGenerating(false);
        }
        if (data.type === "TRANSCRIPT") {
          setTranscripts(prev => [...prev, { 
            sender: 'remote', 
            text: data.text, 
            timestamp: Date.now() 
          }]);
        }
        if (data.type === "SCOPE_UPDATE") {
          setLiveScopeItems(prev => [...prev, data.item]);
        }
      } catch (err) {
        console.error("❌ Failed to parse data message", err);
      }
    };

    // Attach Listeners
    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);       // <-- Added back
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected); // <-- Added back
    room.on(RoomEvent.DataReceived, handleDataReceived);

    // Cleanup
    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  // --- Deepgram Logic ---
  const handleChunkAnalysis = async (text: string) => {
    if (!isPainter) return;
    try {
      const res = await fetch(`/api/subdomain/${slug}/analyze-chunk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.item) {
        setLiveScopeItems(prev => [...prev, data.item]);
        sendData('SCOPE_UPDATE', { item: data.item });
      }
    } catch (err) {
      console.error("AI Error", err);
    }
  };

  const toggleTranscription = useCallback(async () => {
    if (isTranscribing) {
      deepgramLiveRef.current?.requestClose();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsTranscribing(false);
      return;
    }

    try {
      setIsTranscribing(true);
      const res = await fetch(`/api/subdomain/${slug}/deepgram/token`);
      const data = await res.json();
      
      const deepgram = createClient(data.key);
      const connection = deepgram.listen.live({
        model: "nova-2", 
        language: "en-US", 
        smart_format: true, 
        encoding: "linear16", 
        sample_rate: 16000, 
        interim_results: true
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
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const blob = new Blob([PCM_WORKLET_CODE], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      
      await audioContext.audioWorklet.addModule(blobUrl);
      
      const source = audioContext.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(audioContext, 'pcm-processor');
      
      worklet.port.onmessage = (e) => deepgramLiveRef.current?.send(e.data);
      source.connect(worklet);
      worklet.connect(audioContext.destination);

    } catch (err) {
      console.error("Deepgram Error", err);
      if (audioContextRef.current) audioContextRef.current.close();
      setIsTranscribing(false);
    }
  }, [isTranscribing, sendData, slug, isPainter]);

  // --- AI Gen Logic ---
  const triggerAI = async (slug: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    if (!videoElement) {
      console.warn("⚠️ No video element found");
      setIsGenerating(false);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext("2d")?.drawImage(videoElement, 0, 0);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.7);

    try {
      const response = await fetch(`/api/subdomain/${slug}/replicate/rooms-mockup`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, prompt: "modern interior design renovation" }),
      });
      const result = await response.json();
      if (result.url) {
        setActiveMockupUrl(result.url);
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
      room, isConnecting, error, isPainter, laserPosition, activeMockupUrl, 
      isGenerating, isTranscribing, transcripts, liveScopeItems,
      toggleTranscription, sendData, triggerAI 
    }}>
      <LiveKitRoom 
        room={room} 
        token={token} 
        serverUrl={serverUrl} 
        connect={true}  
        video={true}  
        audio={true}
        connectOptions={{ autoSubscribe: true }}
      >
        {children}
      </LiveKitRoom>
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoomContext must be used within RoomProvider");
  return ctx;
};