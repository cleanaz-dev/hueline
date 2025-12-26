'use client';

import { useEffect, useState } from 'react';
import { RoomProvider } from '@/context/room-context';
import { LiveStage } from './live-stage';
import { ClientStage } from './client-stage';
import { useSearchParams } from 'next/navigation';
import { RoomData } from '@/types/room-types';

interface RoomClientProps {
  roomId: string;
  roomData: RoomData;
  slug: string; // Passed from the server page
}

export function RoomClient({ roomId, roomData, slug }: RoomClientProps) {
  const searchParams = useSearchParams();
  
  // 1. Determine Role based on URL (?role=client)
  const isClient = searchParams.get('role') === 'client';
  
  // 2. Client "Join" screen state
  const [hasJoined, setHasJoined] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // FIXED: Reverted to your original identity logic
        const identity = isClient 
          ? `Homeowner-${Math.floor(Math.random() * 10000)}` 
          : 'Painter'; 

        const response = await fetch(
          `/api/subdomain/${slug}/livekit/token?room=${roomId}&username=${identity}`
        );
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Token fetch error:', error);
      }
    };

    fetchToken();
  }, [roomId, slug, isClient]);

  if (!token) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Loading Session...
      </div>
    );
  }

  // 3. Client Landing Screen (Requires interaction to start audio context)
  if (isClient && !hasJoined) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl text-white font-bold mb-4">Ready for your Walkthrough?</h1>
        <p className="text-zinc-500 mb-8">Click below to join the Painter.</p>
        <button 
          onClick={() => setHasJoined(true)}
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition"
        >
          Join Room
        </button>
      </div>
    );
  }

  // 4. Shared Room Provider
  // Both users connect here. "isPainter" determines permissions in your Context.
  return (
    <RoomProvider 
      token={token} 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!} 
      isPainter={!isClient} 
      slug={slug}
    >
      <div className="h-screen w-full bg-black">
        {isClient ? (
          <ClientStage />
        ) : (
          <LiveStage slug={slug} />
        )}
      </div>
    </RoomProvider>
  );
}