'use client';

import { useRoomContext } from '@/context/room-context';
import { VideoTrack, useTracks, isTrackReference } from '@livekit/components-react'; // Added isTrackReference
import { Track } from 'livekit-client';
import { useRef } from 'react';

export const LiveStage = ({ slug }: { slug: string }) => {
  const { 
    laserPosition, 
    sendData, 
    isPainter, 
    triggerAI, 
    isGenerating, 
    activeMockupUrl 
  } = useRoomContext();
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 1. Get tracks (keep placeholder: true to know if someone is there but not subbed)
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  
  // 2. Find the remote track
  const remoteTrack = tracks.find(t => !t.participant.isLocal);

  const handlePointer = (e: React.MouseEvent) => {
    if (!isPainter || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    sendData('POINTER', { x, y });
  };

  return (
    <div 
      ref={containerRef} 
      onClick={handlePointer} 
      className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden cursor-crosshair border border-zinc-800 shadow-2xl"
    >
      {/* 3. Use isTrackReference to check if it's a real track vs a placeholder */}
      {remoteTrack && isTrackReference(remoteTrack) ? (
        <VideoTrack 
          trackRef={remoteTrack} 
          className="w-full h-full object-cover" 
        />
      ) : (
        <div className="flex items-center justify-center h-full text-zinc-500 animate-pulse">
          {remoteTrack ? "Camera is off..." : "Waiting for client to join..."}
        </div>
      )}

      {/* Laser Pointer Ping */}
      {laserPosition && (
        <div 
          className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-cyan-400 rounded-full animate-ping shadow-[0_0_15px_cyan]"
          style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }}
        />
      )}

      {/* AI Mockup Reveal Overlay */}
      {activeMockupUrl && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500 z-50">
           <img 
             src={activeMockupUrl} 
             className="max-h-[80%] rounded-lg shadow-2xl border-4 border-white/10 object-contain" 
             alt="AI Mockup" 
           />
           <div className="mt-4 flex gap-4">
             <button 
               onClick={(e) => { e.stopPropagation(); window.open(activeMockupUrl); }} 
               className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition"
             >
               View Full 8K
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); /* logic to close */ }} 
               className="bg-zinc-800 text-white px-6 py-2 rounded-full text-sm font-bold"
             >
               Close Preview
             </button>
           </div>
        </div>
      )}

      {/* Painter HUD */}
      {isPainter && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button 
            disabled={isGenerating || !remoteTrack}
            onClick={(e) => { e.stopPropagation(); triggerAI(slug); }}
            className="bg-cyan-500 text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-all shadow-lg disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            {isGenerating ? 'AI is Painting...' : '📸 Instant AI Mockup'}
          </button>
        </div>
      )}
    </div>
  );
};