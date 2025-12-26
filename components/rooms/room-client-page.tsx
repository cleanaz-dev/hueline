'use client';

import { useEffect, useState } from 'react';
import { RoomProvider } from '@/context/room-context';
import { LiveStage } from './live-stage';
import { ClientStage } from './client-stage';
import { useSearchParams } from 'next/navigation';
import { RoomData } from '@/types/room-types';
import { Copy, Check } from 'lucide-react';

interface RoomClientProps {
  roomId: string;
  roomData: RoomData;
  slug: string;
}

export function RoomClient({ roomId, roomData, slug }: RoomClientProps) {
  const searchParams = useSearchParams();
  // Role Detection: If ?role=client exists, you are the client. Otherwise, you are the painter.
  const isClient = searchParams.get('role') === 'client';
  
  const [token, setToken] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // Identity MUST be unique for every user, or they will kick each other out.
        const identity = isClient 
          ? `Client-${Math.floor(Math.random() * 10000)}` 
          : 'Painter-Host'; 

        // Important: roomId determines the "Meeting Room". It must be identical for both.
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

  const copyInvite = () => {
    const url = `${window.location.origin}/meet/${roomId}?role=client`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  // Simple "Lobby" for Client
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
      <div className="flex flex-col h-screen w-full bg-black">
        {/* Painter Header */}
        {!isClient && (
          <header className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-950 z-50">
            <h2 className="text-white font-bold">{roomId}</h2>
            <button onClick={copyInvite} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">
              {copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copied' : 'Invite Client'}
            </button>
          </header>
        )}

        {/* Render Stage based on Role */}
        <div className="flex-1 relative overflow-hidden">
          {isClient ? <ClientStage /> : <LiveStage slug={slug} />}
        </div>
      </div>
    </RoomProvider>
  );
}