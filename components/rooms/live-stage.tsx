'use client';

import React, { useRef } from 'react';
import { useRoomContext } from '@/context/room-context';
import { 
  VideoTrack, 
  useTracks,
  RoomAudioRenderer,
  isTrackReference, 
  type TrackReference 
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Maximize2, Camera, Sparkles, X } from 'lucide-react';

interface LiveStageProps {
  slug: string;
}

export const LiveStage = ({ slug }: LiveStageProps) => {
  const { 
    laserPosition, 
    sendData, 
    isPainter, 
    triggerAI, 
    isGenerating, 
    activeMockupUrl 
  } = useRoomContext();
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 1. Fetch all camera tracks in the room
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }]
  );
  
  // 2. Distinguish between who is who
  const localTrack = tracks.find(t => t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;
  const remoteTrack = tracks.find(t => !t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;

  // 3. Handle the Laser Pointer (Painter clicks to ping)
  const handlePointer = (e: React.MouseEvent) => {
    if (!isPainter || !containerRef.current || activeMockupUrl) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    // Convert to 0-1 percentage for cross-device consistency
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    sendData('POINTER', { x, y });
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center p-4">

       <RoomAudioRenderer />
      
      {/* --- MAIN VIDEO VIEWPORT --- */}
      <div 
        ref={containerRef} 
        onClick={handlePointer} 
        className="relative w-full max-w-5xl aspect-video bg-zinc-950 rounded-3xl overflow-hidden cursor-crosshair border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >


        {/* VIEW LOGIC: 
            Painter sees the Remote (Client) camera as the main feed.
            Client sees their Local camera as the main feed.
        */}
        {isPainter ? (
          remoteTrack ? (
            <VideoTrack trackRef={remoteTrack} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600">
              <div className="w-12 h-12 border-2 border-zinc-800 border-t-cyan-500 rounded-full animate-spin mb-4" />
              <p className="font-medium tracking-tight animate-pulse">Waiting for Client's Property View...</p>
            </div>
          )
        ) : (
          localTrack ? (
            <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600">
              <Camera className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium animate-pulse">Initializing your camera...</p>
            </div>
          )
        )}

        {/* --- OVERLAY: LASER POINTER PING --- */}
        {laserPosition && (
          <div 
            className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-cyan-400 rounded-full animate-ping shadow-[0_0_20px_cyan] z-30"
            style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }}
          />
        )}

        {/* --- OVERLAY: AI MOCKUP REVEAL --- */}
        {activeMockupUrl && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500 z-50">
             <div className="relative max-w-full max-h-[85%] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                <img 
                  src={activeMockupUrl} 
                  className="w-full h-full object-contain" 
                  alt="AI Mockup" 
                />
             </div>
             <div className="mt-6 flex gap-3">
               <button 
                 onClick={(e) => { e.stopPropagation(); window.open(activeMockupUrl); }} 
                 className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
               >
                 <Maximize2 className="w-4 h-4" /> Export 8K
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); /* Clear logic in context if needed */ }} 
                 className="bg-zinc-800 text-white px-8 py-3 rounded-full font-bold border border-white/10 hover:bg-zinc-700 transition-all"
               >
                 Close Preview
               </button>
             </div>
          </div>
        )}

        {/* --- PAINTER HUD (CONTROLS) --- */}
        {isPainter && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
            <button 
              disabled={isGenerating || !remoteTrack}
              onClick={(e) => { e.stopPropagation(); triggerAI(slug); }}
              className="group relative bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI Rendering Vision...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Instant AI Mockup
                </span>
              )}
              {/* Button Glow effect */}
              {!isGenerating && (
                <div className="absolute inset-0 rounded-full bg-cyan-400 blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
              )}
            </button>
          </div>
        )}

        {/* Identity Labels */}
        <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none">
            <div className={`w-2 h-2 rounded-full animate-pulse ${remoteTrack ? 'bg-green-500' : 'bg-zinc-600'}`} />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
                {isPainter ? 'Client Property View' : 'Your Live Stream'}
            </span>
        </div>
      </div>

      {/* --- PICTURE-IN-PICTURE (PIP) --- */}
      {/* Painter sees their own face in the corner */}
      {isPainter && localTrack && (
        <div className="absolute bottom-8 right-8 w-40 h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-20 group transition-all hover:w-48 hover:h-64">
          <VideoTrack trackRef={localTrack} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />

          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-tighter">
            You
          </div>
            
        </div>
      )}

      {/* Client sees the Painter in the corner (if painter has camera on) */}
      {!isPainter && remoteTrack && (
        <div className="absolute bottom-8 right-8 w-40 h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-20">
          <VideoTrack trackRef={remoteTrack} className="w-full h-full object-cover" />
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-tighter">
            Painter
          </div>
        </div>
      )}

    </div>
  );
};