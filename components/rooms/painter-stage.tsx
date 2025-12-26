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
import { Maximize2, Camera, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

interface LiveStageProps {
  slug: string;
}

export const PainterStage = ({ slug }: LiveStageProps) => {
  const { 
    laserPosition, 
    sendData, 
    isPainter, 
    triggerAI, 
    isGenerating, 
    activeMockupUrl 
  } = useRoomContext();
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fetch only Camera tracks
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  
  const localTrack = tracks.find(t => t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;
  const remoteTrack = tracks.find(t => !t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;

  const handlePointer = (e: React.MouseEvent) => {
    if (!isPainter || !containerRef.current || activeMockupUrl) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    sendData('POINTER', { x, y });
  };

  return (
    <div className="relative h-[85vh] w-full bg-black flex flex-col md:p-4 overflow-hidden">
      {/* 🔊 THE MAGIC LINE: Handles all audio (User + AI) */}
      <RoomAudioRenderer />

      {/* MAIN VIEWPORT */}
      <div 
        ref={containerRef} 
        onClick={handlePointer} 
        className="relative flex-1 w-full max-w-[1600px] mx-auto aspect-video bg-zinc-950 md:rounded-3xl overflow-hidden border border-white/5 cursor-crosshair shadow-2xl"
      >
        {/* Main Feed Logic */}
        {isPainter ? (
          remoteTrack ? (
            <VideoTrack trackRef={remoteTrack} className="w-full h-full object-contain" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4">
               <div className="w-10 h-10 border-2 border-t-cyan-500 border-zinc-900 rounded-full animate-spin" />
               <p className="text-[10px] uppercase font-black tracking-widest">Awaiting Client Feed...</p>
            </div>
          )
        ) : (
          localTrack && <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
        )}

        {/* LASER POINTER */}
        {laserPosition && (
          <div 
            className="absolute w-12 h-12 -ml-6 -mt-6 border-4 border-cyan-400 rounded-full animate-ping z-50 pointer-events-none"
            style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }}
          />
        )}

        {/* AI MOCKUP OVERLAY */}
        {activeMockupUrl && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4 z-[100] animate-in fade-in zoom-in duration-300">
             <img src={activeMockupUrl} className="max-h-[80%] rounded-xl shadow-2xl border border-white/10" alt="Mockup" />
             <div className="mt-8 flex gap-4">
               <button onClick={() => window.open(activeMockupUrl)} className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2">
                 <Maximize2 className="w-4 h-4" /> Save HD
               </button>
             </div>
          </div>
        )}

        {/* PIP (PICTURE IN PICTURE) */}
        <div className="absolute bottom-6 right-6 w-32 h-48 md:w-48 md:h-72 rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-40 ring-1 ring-white/20 bg-zinc-900">
           {isPainter ? (
             localTrack && <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
           ) : (
             remoteTrack && <VideoTrack trackRef={remoteTrack} className="w-full h-full object-cover" />
           )}
           <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/60 text-[8px] font-black uppercase text-white">
             {isPainter ? "You" : "Painter"}
           </div>
        </div>
      </div>

      {/* PAINTER HUD */}
      {isPainter && (
        <div className="py-6 flex justify-center">
           <Button
             disabled={isGenerating || !remoteTrack}
             onClick={(e) => { e.stopPropagation(); triggerAI(slug); }}
             className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-black px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-cyan-500/20"
           >
             {isGenerating ? "AI is Generating..." : "Generate AI Mockup"}
           </Button>
        </div>
      )}
    </div>
  );
};