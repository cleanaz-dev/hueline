'use client';

import { useEffect, useState } from 'react';
import { RoomProvider } from '@/context/room-context';
import { ClientStage } from './client-stage';
import { PainterStage } from './painter-stage';
import { CameraHandler } from './camera-handler';
import { RoomData } from '@/types/room-types';

interface RoomClientProps {
  roomId: string;
  roomData: RoomData;
  slug: string;
  role?: string
}

export function RoomClient({ roomId, roomData, slug, role }: RoomClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  
  const isClient = role === "client";

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const identity = isClient 
          ? `Client-${Math.floor(Math.random() * 10000)}` 
          : `Painter-${Math.floor(Math.random() * 10000)}`;

        const res = await fetch(
          `/api/subdomain/${slug}/livekit/token?room=${roomId}&username=${identity}`
        );
        const data = await res.json();
        setToken(data.token);
      } catch (error) {
        console.error('Token Error', error);
      }
    };
    fetchToken();
  }, [roomId, slug, isClient]);

  if (!token) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

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

  return (
    <RoomProvider 
      token={token} 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!} 
      isPainter={!isClient} 
      slug={slug}
    >
      <CameraHandler /> 

      {/* 👇 FIXED: Changed h-screen to h-full */}
      <div className="flex flex-col w-full ">
        <div className="flex-1 relative overflow-hidden h-full">
          {isClient ? <ClientStage /> : <PainterStage slug={slug} roomId={roomId} />}
        </div>
      </div>
    </RoomProvider>
  );
}
