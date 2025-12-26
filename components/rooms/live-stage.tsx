'use client';

import React, { useRef } from 'react';
import { useRoomContext } from '@/context/room-context';
import { 
  VideoTrack, useTracks, RoomAudioRenderer, isTrackReference 
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Maximize2 } from 'lucide-react';

export const LiveStage = ({ slug }: { slug: string }) => {
  const { 
    laserPosition, sendData, triggerAI, isGenerating, activeMockupUrl 
  } = useRoomContext();
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 1. Get Camera Tracks & Filter
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const validTracks = tracks.filter(isTrackReference);
  
  const localTrack = validTracks.find(t => t.participant.isLocal);
  const remoteTrack = validTracks.find(t => !t.participant.isLocal);

  // 2. Handle Laser Pointer
  const handlePointer = (e: React.MouseEvent) => {
    if (!containerRef.current || activeMockupUrl) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Send to Client
    sendData('POINTER', { x, y });
  };

  return (
    <div className="relative h-full w-full flex flex-col p-2 md:p-4">
      <RoomAudioRenderer />

      <div 
        ref={containerRef} 
        onClick={handlePointer} 
        className="relative flex-1 w-full max-w-[1600px] mx-auto aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-white/10 cursor-crosshair"
      >
        {/* If remote (Client) is here, show them. Else show local (Painter) or spinner */}
        {remoteTrack ? (
          <VideoTrack trackRef={remoteTrack} className="w-full h-full object-contain" />
        ) : (
          localTrack ? (
             <VideoTrack trackRef={localTrack} className="w-full h-full object-cover opacity-50" />
          ) : <div className="text-white text-center mt-20">Loading Camera...</div>
        )}

        {/* Laser Pointer Overlay */}
        {laserPosition && (
          <div 
            className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-cyan-400 bg-cyan-400/20 rounded-full animate-ping pointer-events-none"
            style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }}
          />
        )}

        {/* AI Mockup Overlay */}
        {activeMockupUrl && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
             <img src={activeMockupUrl} className="max-h-[85%] rounded shadow-2xl" alt="Mockup" />
             <button onClick={() => window.open(activeMockupUrl)} className="mt-4 bg-white text-black px-6 py-2 rounded-full flex gap-2 font-bold">
               <Maximize2 size={16} /> Open HD
             </button>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-20 flex items-center justify-center gap-4">
         <button 
           disabled={isGenerating}
           onClick={() => triggerAI(slug)}
           className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black px-8 py-3 rounded-xl font-bold uppercase tracking-wider"
         >
           {isGenerating ? "Generating..." : "Generate AI Idea"}
         </button>
      </div>
    </div>
  );
};