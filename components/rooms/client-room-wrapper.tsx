'use client';

import { useEffect, useState } from 'react';
import { RoomProvider } from '@/context/room-context'; // Your existing context
import { ClientStage } from './client-stage';

interface Props {
  roomId: string;
  slug: string;
  roomData: any;
  companyName: string | null
}

export function ClientRoomWrapper({ roomId, slug, roomData, companyName }: Props) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch the token specifically for the Client
    const fetchToken = async () => {
      const identity = `Guest-${Math.floor(Math.random() * 10000)}`;
      const res = await fetch(`/api/subdomain/${slug}/livekit/token?room=${roomId}&username=${identity}`);
      const data = await res.json();
      setToken(data.token);
    };
    fetchToken();
  }, [roomId, slug]);

  if (!token) {
    return <div className="h-screen bg-black flex items-center justify-center text-white">Connecting to {companyName}...</div>;
  }

  return (
    <RoomProvider 
      token={token} 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!} 
      isPainter={false} // Client is NOT the painter
      subdomain={slug}
    >
      <ClientStage />
    </RoomProvider>
  );
}