'use client';

import { useEffect, useState } from 'react';
import { RoomProvider } from '@/context/room-context';
import { useOwner } from '@/context/owner-context';
import { useSearchParams } from 'next/navigation';
import { CameraHandler } from './camera-handler';
import { RoomData } from '@/types/room-types';
import { VideoPresets, RoomOptions } from 'livekit-client';

// The two stage components we created
import { PainterStage } from './painter-stage';
import { ClientStage } from './client-stage';

export function RoomClient({ roomId, roomData }: { roomId: string; roomData: RoomData }) {
  const searchParams = useSearchParams();
  
  // 1. Determine Role
  const isClient = searchParams.get('role') === 'client';
  const roleTitle = isClient ? 'Homeowner' : 'Painter';

  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { subdomain } = useOwner();
  const currentSlug = subdomain.slug;

  // 2. HD Room Configuration
  // This tells LiveKit to prioritize 720p HD for the site survey
  const roomOptions: RoomOptions = {
    adaptiveStream: true,
    dynacast: true,
    publishDefaults: {
      simulcast: true,
      videoSimulcastLayers: [
        VideoPresets.h720, // HD Layer
        VideoPresets.h360, // Fallback Layer
      ],
      videoCodec: 'vp8',
    },
    videoCaptureDefaults: {
      resolution: VideoPresets.h720.resolution,
    },
  };

  // 3. Fetch Access Token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true);
        
        // Identity: Random for Homeowner, Fixed for Painter
        const identity = isClient 
          ? `Homeowner-${Math.floor(Math.random() * 1000)}` 
          : 'Painter';
        
        const response = await fetch(
          `/api/subdomain/${currentSlug}/livekit/token?room=${roomId}&username=${identity}`
        );
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Failed to fetch token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [roomId, currentSlug, isClient]);

  // Loading Screen
  if (isLoading || !token) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-8 h-8 border-2 border-t-cyan-500 border-white/10 rounded-full animate-spin" />
        <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-50">
          Entering Secure Room...
        </p>
      </div>
    );
  }

  // 4. THE LIVE ROOM (No Join Button Version)
  return (
    <RoomProvider 
      token={token} 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!} 
      isPainter={!isClient}
      subdomain={currentSlug}
      options={roomOptions} // Pass the HD settings into the context/LiveKit provider
    >
      <div className="h-screen bg-black flex flex-col overflow-hidden">
        
        {/* --- GLOBAL HEADER --- */}
        <header className="p-4 border-b border-white/10 flex justify-between items-center bg-[#050505] z-50">
          <div className="flex flex-col">
              <h2 className="text-white font-bold text-xs uppercase tracking-tight">
                {roomId.replace(/-/g, ' ')}
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                  Site Survey Live
                </p>
              </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isClient && (
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/my/rooms/${roomId}?role=client`;
                  navigator.clipboard.writeText(url);
                  alert('Invite link copied!');
                }}
                className="bg-zinc-900 border border-white/5 text-zinc-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition"
              >
                Copy Client Link
              </button>
            )}
            <div className="hidden md:block px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                User: <span className="text-white">{roleTitle}</span>
            </div>
          </div>
        </header>

        {/* --- MEDIA HANDLER --- */}
        {/* This triggers the Mic/Camera as soon as the room is ready */}
        <CameraHandler />

        {/* --- VIEWPORT: Switch based on role --- */}
        <main className="flex-1 relative overflow-hidden">
          {isClient ? (
            <ClientStage slug={currentSlug} />
          ) : (
            <PainterStage slug={currentSlug} />
          )}
        </main>
        
      </div>
    </RoomProvider>
  );
}