'use client';

import { useEffect, useState } from 'react';
import { RoomProvider } from '@/context/room-context';
import { ClientStage } from './client-stage';
import { PainterStage } from './painter-stage';
import { QuickSessionStage } from './quick-session-stage'; // 👈 Import new stage
import { CameraHandler } from './camera-handler';
import { RoomData } from '@/types/room-types';

interface RoomClientProps {
  roomId: string;
  roomData: RoomData;
  slug: string;
  role?: string;
  mode?: 'project' | 'quick'; // 👈 New Prop
}

export function RoomClient({ 
  roomId, 
  roomData, 
  slug, 
  role, 
  mode = 'project' // Default to project
}: RoomClientProps) {
  
  const [token, setToken] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  
  const isClient = role === "client";

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const identity = isClient 
          ? `Client-${Math.floor(Math.random() * 10000)}` 
          : `${mode === 'quick' ? 'Quick' : 'Painter'}-${Math.floor(Math.random() * 10000)}`;

        const res = await fetch(
          `/api/subdomain/${slug}/room/${roomId}/token?username=${identity}`
        );
        const data = await res.json();
        setToken(data.token);
      } catch (error) {
        console.error('Token Error', error);
      }
    };
    fetchToken();
  }, [roomId, slug, isClient, mode]);

  // Loading State
  if (!token) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Initializing Secure Room...</div>
      </div>
    );
  }

  // Client Interstitial
  if (isClient && !hasJoined) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl text-white font-bold mb-4">Welcome to the Walkthrough</h1>
        <button 
          onClick={() => setHasJoined(true)}
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition"
        >
          Join Session
        </button>
      </div>
    );
  }

  // --- RENDER LOGIC ---
  const renderStage = () => {
    if (isClient) return <ClientStage />;
    if (mode === 'quick') return <QuickSessionStage />;
    return <PainterStage slug={slug} roomId={roomId} />;
  };

  return (
    <RoomProvider 
      token={token} 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!} 
      isPainter={!isClient} 
      slug={slug}
    >
      <CameraHandler /> 

      <div className="flex flex-col w-full h-full bg-background">
        <div className="flex-1 relative overflow-hidden h-full">
          {renderStage()}
        </div>
      </div>
    </RoomProvider>
  );
}