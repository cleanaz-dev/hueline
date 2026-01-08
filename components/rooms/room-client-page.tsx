'use client';
import { useEffect, useState } from 'react';
import { RoomProvider } from '@/context/room-context';
import { ClientStage } from './client-stage';
import { ClientSelfServeStage } from './stage/client-self-serve-stage';
import { PainterStage } from './painter-stage';
import { QuickSessionStage } from './quick-session-stage';
import { CameraHandler } from './camera-handler';
import { RoomData } from '@/types/room-types';

interface RoomClientProps {
  roomId: string;
  roomData: RoomData;
  slug: string;
  role?: string;
  mode?: 'project' | 'quick' | 'self-serve';
}

export function RoomClient({ 
  roomId, 
  roomData, 
  slug, 
  role, 
  mode = 'project'
}: RoomClientProps) {
  
  const [token, setToken] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  
  const isClient = role === "client";
  const isHost = mode === 'self-serve' ? true : !isClient;

useEffect(() => {
  let lastTouchY = 0;
  let lastTouchX = 0;
  let maybePreventPullToRefresh = false;

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    lastTouchY = e.touches[0].clientY;
    lastTouchX = e.touches[0].clientX;
    // Check BOTH scroll positions for landscape/portrait
    maybePreventPullToRefresh = window.pageYOffset === 0 && window.pageXOffset === 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    const touchYDelta = touchY - lastTouchY;
    const touchXDelta = touchX - lastTouchX;
    lastTouchY = touchY;
    lastTouchX = touchX;

    if (maybePreventPullToRefresh) {
      // Prevent if pulling down OR pulling right (for landscape mode)
      if (touchYDelta > 0 || touchXDelta > 0) {
        e.preventDefault();
        return false;
      }
      maybePreventPullToRefresh = false;
    }
  };

  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });

  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
  };
}, []);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const identity = isHost
          ? `host-${mode === 'quick' ? 'quick' : 'painter'}-${Math.floor(Math.random() * 10000)}` 
          : `client-${Math.floor(Math.random() * 10000)}`;
        
        const res = await fetch(
          `/api/subdomain/${slug}/room/${roomId}/token?identity=${identity}`
        );
        const data = await res.json();
        setToken(data.token);
      } catch (error) {
        console.error('Token Error', error);
      }
    };
    fetchToken();
  }, [roomId, slug, isHost, mode]);

  // Loading State
  if (!token) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Initializing Secure Room...</div>
      </div>
    );
  }

  // Client Interstitial (skip for self-serve)
  if (isClient && !hasJoined && mode !== 'self-serve') {
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
    if (isClient && mode === 'self-serve') {
      return <ClientSelfServeStage slug={slug} roomId={roomId} />;
    }
    if (isClient) return <ClientStage />;
    if (mode === 'quick') return <QuickSessionStage />;
    return <PainterStage slug={slug} roomId={roomId} />;
  };

  return (
    <RoomProvider 
      token={token} 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_VIDEO_URL!} 
      isPainter={isHost} 
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