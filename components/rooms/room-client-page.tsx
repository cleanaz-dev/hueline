'use client';

import { useEffect, useState } from 'react';
import { RoomProvider } from '@/context/room-context';
import { LiveStage } from './live-stage';
import { useOwner } from '@/context/owner-context';
import { useSearchParams } from 'next/navigation';
import { CameraHandler } from './camera-handler';

export function RoomClient({ roomId }: { roomId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false)
  const { subdomain } = useOwner();
  
  const currentSlug = subdomain.slug;

  const searchParams = useSearchParams();
  const isClient = searchParams.get('role') === 'client';

useEffect(() => {
  const fetchToken = async () => {
    try {
      setIsLoading(true);
      
      // Determine identity based on the role
      const identity = isClient ? `Homeowner-${Math.floor(Math.random() * 1000)}` : 'Painter';
      
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

  if (isLoading || !token) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Initializing Secure Room...
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold mb-2">Hue-Line Virtual Room</h1>
          <p className="text-zinc-500">Ready to show the property?</p>
        </div>
        
        <button 
          onClick={() => setHasStarted(true)} // THIS tap satisfies the mobile browser
          className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg shadow-xl animate-bounce"
        >
          Join Walkthrough
        </button>
      </div>
    );
  }

  return (
    <RoomProvider 
      token={token} 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!} 
      isPainter={!isClient}
      subdomain={currentSlug}
    >
      <div className="h-screen bg-black flex flex-col">
        {/* Header with Share Link */}
        <header className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-950">
          <div>
            <h2 className="text-white font-bold">{roomId.replace(/-/g, ' ')}</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Live Virtual Estimate</p>
          </div>
          
          <button 
            onClick={() => {
              const url = `${window.location.origin}/my/rooms/${roomId}?role=client&username=John`;
              navigator.clipboard.writeText(url);
              alert('Invite link copied! Send this to your client.');
            }}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition"
          >
            Invite Client
          </button>
        </header>
        <CameraHandler />

        {/* The Magic Stage */}
        <div className="flex-1 p-4">
          <LiveStage slug={currentSlug} />
        </div>
      </div>
    </RoomProvider>
  );
}