"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Room,
  RoomEvent,
  DataPacket_Kind,
  RemoteParticipant,
  Track,
} from "livekit-client";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import {
  createClient,
  LiveClient,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";
import { v4 as uuidv4 } from "uuid";
import useSWR from "swr";

// --- 1. SHARED INTERFACES ---
export interface ScopeItem {
  id: string;
  category: "PREP" | "PAINT" | "REPAIR" | "NOTE";
  item: string;
  action: string;
  timestamp: string;
}

interface TranscriptItem {
  sender: "local" | "remote";
  text: string;
  timestamp: number;
}
interface LaserPosition {
  x: number;
  y: number;
}

interface RoomContextProps {
  // Connection & Room
  room: Room;
  isConnecting: boolean;
  error: string | null;
  isPainter: boolean;

  // Visuals
  laserPosition: LaserPosition | null;
  activeMockupUrl: string | null;

  // States
  isGenerating: boolean;
  isTranscribing: boolean;
  transcripts: TranscriptItem[];
  liveScopeItems: ScopeItem[]; // Now driven by SWR

  // Actions
  triggerSpotter: () => Promise<void>;
  isSpotting: boolean;
  toggleTranscription: () => void;
  sendData: (type: string, payload: any) => void;
  triggerAI: (slug: string) => Promise<void>;

  // Scope Actions
  addManualItem: (category: string, item: string, action: string) => void;
  removeScopeItem: (id: string) => void;
  saveAndEndSession: () => Promise<void>;
}

const RoomContext = createContext<RoomContextProps | undefined>(undefined);

// --- 2. AUDIO PROCESSOR (Buffered for performance) ---
const PCM_WORKLET_CODE = `
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Int16Array(2048); 
    this.offset = 0;
    console.log("🔊 WORKLET: Processor Initialized"); 
  }
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    const float32 = input[0];
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      this.buffer[this.offset++] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      if (this.offset >= this.buffer.length) {
        this.port.postMessage(this.buffer.slice());
        this.offset = 0;
      }
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

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
  slug,
}: RoomProviderProps) => {
  // --- A. ROOM INIT ---
const room = useMemo(() => {
  return new Room({
    adaptiveStream: false,
    dynacast: false,            
    publishDefaults: { 
      simulcast: true,         
      videoEncoding: {
        maxBitrate: 6_000_000,  
        maxFramerate: 30,
      },
    },
    videoCaptureDefaults: {
      resolution: {
        width: 1920,
        height: 1080,
        frameRate: 30,
      },
    },
  });
}, []);

  // --- B. STATE ---
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [laserPosition, setLaserPosition] = useState<LaserPosition | null>(
    null
  );
  const [activeMockupUrl, setActiveMockupUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [isSpotting, setIsSpotting] = useState(false);

  // Refs for Audio
  const deepgramLiveRef = useRef<LiveClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPlaybackContext = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);

  // --- C. SCOPE DATA (SWR + HYBRID SYNC) ---
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: swrData, mutate } = useSWR(
    room.name ? `/api/subdomain/${slug}/room/${room.name}/scope` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Always fallback to empty array if loading/error
  const liveScopeItems: ScopeItem[] = swrData?.scopeData?.items || [];

  // --- D. HELPER: SEND DATA ---
  const sendData = useCallback(
    (type: string, payload: any) => {
      if (room.state !== "connected" || !room.localParticipant) return;
      const strData = JSON.stringify({ type, ...payload });
      const data = new TextEncoder().encode(strData);
      const kind =
        type === "POINTER" ? DataPacket_Kind.LOSSY : DataPacket_Kind.RELIABLE;
      room.localParticipant.publishData(data, {
        reliable: kind === DataPacket_Kind.RELIABLE,
      });
    },
    [room]
  );

  // --- E. EVENT LISTENERS ---
  useEffect(() => {
    const handleConnected = () => setIsConnecting(false);
    const handleDisconnected = () => setIsConnecting(false);

    const handleDataReceived = (
      payload: Uint8Array,
      participant?: RemoteParticipant
    ) => {
      try {
        const strData = new TextDecoder().decode(payload);
        const data = JSON.parse(strData);

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
            {
              sender: "remote",
              text: data.text,
              timestamp: Date.now(),
            },
          ]);
        }

        // ⚡ HYBRID SYNC: Receive Update -> Update Local Cache Instantly
        if (data.type === "SCOPE_UPDATE") {
          mutate(
            (curr: any) => ({
              ...curr,
              scopeData: {
                items: [data.item, ...(curr?.scopeData?.items || [])],
              },
            }),
            false
          );
        }

        // ⚡ HYBRID SYNC: Receive Remove -> Update Local Cache Instantly
        if (data.type === "SCOPE_REMOVE") {
          mutate(
            (curr: any) => ({
              ...curr,
              scopeData: {
                items:
                  curr?.scopeData?.items?.filter(
                    (i: ScopeItem) => i.id !== data.id
                  ) || [],
              },
            }),
            false
          );
        }
      } catch (err) {
        console.error("❌ Data Parse Error", err);
      }
    };

    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, mutate]);

  useEffect(() => {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    audioPlaybackContext.current = new AudioContextClass();
  }, []);

  // --- F. INTELLIGENCE HANDLERS ---
  const playAudioData = async (base64Audio: string) => {
    try {
      const ctx = audioPlaybackContext.current;
      if (!ctx) return;

      // 1. Convert Data URI to ArrayBuffer
      // Expected format: "data:audio/mp3;base64,....."
      const base64 = base64Audio.split(",")[1];
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 2. Decode the Audio (This is the heavy lifting)
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);

      // 3. Create Source & Play
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (err) {
      console.error("Audio Playback Error:", err);
    }
  };

  // 1. Chunk Analysis (Triggered by Deepgram)
  const handleChunkAnalysis = async (text: string) => {
    if (!isPainter) return;
    try {
      const res = await fetch(
        `/api/subdomain/${slug}/room/${room.name}/analyze-chunk`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );
      const data = await res.json();

      // If AI finds items, add them to SWR + Broadcast
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: ScopeItem) => {
          // Local Optimistic Update
          mutate(
            (curr: any) => ({
              ...curr,
              scopeData: { items: [item, ...(curr?.scopeData?.items || [])] },
            }),
            false
          );

          // Broadcast to Client
          sendData("SCOPE_UPDATE", { item });
        });
      }
    } catch (err) {
      console.error("AI Error", err);
    }
  };

  // 2. Manual Add (User Clicks +)
  const addManualItem = useCallback(
    (category: string, item: string, action: string) => {
      const newItem: ScopeItem = {
        id: uuidv4(),
        category: category as any,
        item,
        action,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Optimistic UI
      mutate(
        (curr: any) => ({
          ...curr,
          scopeData: { items: [newItem, ...(curr?.scopeData?.items || [])] },
        }),
        false
      );

      sendData("SCOPE_UPDATE", { item: newItem });

      // Background Sync
      if (room?.name) {
        fetch(`/api/subdomain/${slug}/room/${room.name}/scope/add`, {
          method: "POST",
          body: JSON.stringify(newItem),
        }).catch(console.error);
      }
    },
    [slug, room, sendData, mutate]
  );

  // 3. Manual Remove (User Clicks Trash)
  const removeScopeItem = useCallback(
    (id: string) => {
      // Optimistic UI
      mutate(
        (curr: any) => ({
          ...curr,
          scopeData: {
            items:
              curr?.scopeData?.items?.filter((i: ScopeItem) => i.id !== id) ||
              [],
          },
        }),
        false
      );

      sendData("SCOPE_REMOVE", { id });

      // Background Sync
      if (room?.name) {
        fetch(`/api/subdomain/${slug}/room/${room.name}/scope/remove`, {
          method: "POST",
          body: JSON.stringify({ id }),
        }).catch(console.error);
      }
    },
    [slug, room, sendData, mutate]
  );

  // 4. End Session (Save & Quit)
  const saveAndEndSession = useCallback(async () => {
    if (!room?.name) return;
    try {
      console.log("💾 Ending Session...");
      await fetch(`/api/subdomain/${slug}/room/${room.name}/end`, {
        method: "POST",
      });
      room.disconnect();
      window.location.href = `/my/rooms`;
    } catch (err) {
      console.error("Failed to end session", err);
    }
  }, [slug, room]);

  // --- G. TRANSCRIPTION LOGIC (Deepgram) ---
// --- G. TRANSCRIPTION LOGIC (Fixed & Persisted) ---
const toggleTranscription = useCallback(async () => {
  // --- STOPPING LOGIC ---
  if (isTranscribing) {
    console.log("🛑 Stopping Transcription...");
    
    // 1. Close Deepgram
    if (deepgramLiveRef.current) {
      deepgramLiveRef.current.requestClose();
      deepgramLiveRef.current = null;
    }

    // 2. Disconnect & Clean Audio Nodes (Crucial)
    if (workletRef.current) {
      workletRef.current.disconnect();
      workletRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // 3. Close Context
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    streamRef.current = null;
    setIsTranscribing(false);
    return;
  }

  // --- STARTING LOGIC ---
  try {
    console.log("🚀 Starting Transcription...");
    setIsTranscribing(true);

    const res = await fetch(`/api/subdomain/${slug}/deepgram/token`);
    const data = await res.json();
    console.log("🔑 Token Received");

    const deepgram = createClient(data.key);

    // 1. Get LiveKit Track
    let mediaStreamTrack = room.localParticipant.getTrackPublication(
      Track.Source.Microphone
    )?.track?.mediaStreamTrack;

    if (!mediaStreamTrack) {
      console.log("🎤 Enabling Mic...");
      await room.localParticipant.setMicrophoneEnabled(true);
      mediaStreamTrack = room.localParticipant.getTrackPublication(
        Track.Source.Microphone
      )?.track?.mediaStreamTrack;
    }

    if (!mediaStreamTrack) throw new Error("No Microphone Track Found");

    // ⚡ FIX 1: Clone the track to prevent LiveKit conflicts
    const trackClone = mediaStreamTrack.clone(); 
    const stream = new MediaStream([trackClone]);
    streamRef.current = stream; // Keep ref to stream
    
    // 2. Setup Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    audioContextRef.current = audioContext;
    console.log(`🎛️ Audio Context: ${audioContext.state} (${audioContext.sampleRate}Hz)`);

    // 3. Setup Deepgram
    const connection = deepgram.listen.live({
      model: "nova-3",
      language: "en-US",
      smart_format: true,
      encoding: "linear16",
      sample_rate: audioContext.sampleRate,
      interim_results: true,
    });

    connection.on(LiveTranscriptionEvents.Open, () => console.log("🟢 Deepgram OPEN"));
    connection.on(LiveTranscriptionEvents.Close, () => console.log("🔴 Deepgram CLOSED"));
    connection.on(LiveTranscriptionEvents.Error, (e) => console.error("☠️ Deepgram Error", e));
    
    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0].transcript;
      if (transcript && data.is_final) {
         console.log(`✅ MATCH: ${transcript}`);
         setTranscripts((prev) => [
            ...prev,
            { sender: "local", text: transcript, timestamp: Date.now() },
         ]);
         sendData("TRANSCRIPT", { text: transcript });
         handleChunkAnalysis(transcript);
      }
    });

    await connection.keepAlive();
    deepgramLiveRef.current = connection;

    // 4. Setup Worklet (The Pipeline)
    const blob = new Blob([PCM_WORKLET_CODE], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    await audioContext.audioWorklet.addModule(blobUrl);

    // ⚡ FIX 2: Store nodes in Refs to prevent Garbage Collection
    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;
    
    const worklet = new AudioWorkletNode(audioContext, "pcm-processor");
    workletRef.current = worklet;

    let packetCount = 0;
    worklet.port.onmessage = (e) => {
      // Send to Deepgram
      if (deepgramLiveRef.current?.getReadyState() === 1) {
        deepgramLiveRef.current.send(e.data);
        
        // Debug first 3 packets to prove flow
        if (packetCount < 3) {
          console.log(`🔊 Packet ${packetCount++} sent (Size: ${e.data.byteLength})`);
        }
      }
    };

    // 5. Connect Pipeline (Mic -> Worklet -> Mute -> Speaker)
    source.connect(worklet);
    
    const muteGain = audioContext.createGain();
    muteGain.gain.value = 0; // Prevent feedback
    worklet.connect(muteGain);
    muteGain.connect(audioContext.destination); // Keep graph alive

  } catch (err) {
    console.error("❌ Setup Error", err);
    setIsTranscribing(false);
  }
}, [isTranscribing, sendData, slug, room]);
  // --- H. AI VISUAL GEN LOGIC ---
  const triggerAI = async (slug: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    const videoElement = document.querySelector("video") as HTMLVideoElement;
    if (!videoElement) {
      setIsGenerating(false);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext("2d")?.drawImage(videoElement, 0, 0);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.7);

    try {
      const response = await fetch(
        `/api/subdomain/${slug}/replicate/rooms-mockup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: imageBase64,
            prompt: "modern interior design renovation",
          }),
        }
      );
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

  const triggerSpotter = useCallback(async () => {
    if (isSpotting) return;

    // 🟢 CRITICAL STEP FOR MOBILE:
    // We must "resume" the context immediately upon the user's click.
    if (audioPlaybackContext.current?.state === "suspended") {
      await audioPlaybackContext.current.resume();
    }

    setIsSpotting(true);

    // 1. Capture Frame (Existing Logic)
    const videoElement = document.querySelector("video") as HTMLVideoElement;
    if (!videoElement) {
      setIsSpotting(false);
      return;
    }

    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 480 / videoElement.videoHeight); // Keep it small/fast
    canvas.width = videoElement.videoWidth * scale;
    canvas.height = videoElement.videoHeight * scale;
    canvas
      .getContext("2d")
      ?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.6);

    try {
      // 2. Send to Backend
      const response = await fetch(
        `/api/subdomain/${slug}/room/${room.name}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageBase64 }),
        }
      );

      const result = await response.json();

      // 3. Play Audio using the Mobile-Safe Helper
      if (result.action === "speak" && result.audio) {
        // Pass the full data URI
        await playAudioData(result.audio);

        // Update Chat UI
        setTranscripts((prev) => [
          ...prev,
          {
            sender: "remote",
            text: `👁️ Spotter: ${result.text}`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      console.error("Spotter Error", err);
    } finally {
      setIsSpotting(false);
    }
  }, [isSpotting, slug, room]);

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
        addManualItem,
        removeScopeItem,
        saveAndEndSession,
        triggerSpotter,
        isSpotting,
      }}
    >
     <LiveKitRoom
      room={room}
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={false}
      audio={true}  // 👈 CHANGE THIS TO TRUE
      connectOptions={{ autoSubscribe: true }}
    >
      <RoomAudioRenderer />
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
