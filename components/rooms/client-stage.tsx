'use client';

import React from 'react';
import { useRoomContext } from '@/context/room-context';
import { 
  VideoTrack, 
  useTracks,
  RoomAudioRenderer, 
  isTrackReference, 
  type TrackReference 
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Maximize2, Download } from 'lucide-react';

export function ClientStage() {
  const { 
    laserPosition, 
    activeMockupUrl 
  } = useRoomContext();
  
  // 1. Fetch Tracks
  // We need to distinguish between the "Painter" (Remote) and "You" (Local)
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false }
  ]);
  
  const localTrack = tracks.find(t => t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;
  const remoteTrack = tracks.find(t => !t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;

  return (
    <div className="relative h-full w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* 🔊 Handles Audio (You hear the painter) */}
      <RoomAudioRenderer />

      {/* 🟢 MAIN STAGE: The Painter's Video (Or the AI Mockup) */}
      <div className="relative w-full h-full max-w-[1600px] aspect-video flex items-center justify-center">
        
        {/* CASE A: Active Mockup (Overrides Video) */}
        {activeMockupUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 animate-in fade-in duration-500">
             <img 
               src={activeMockupUrl} 
               className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" 
               alt="Design Proposal" 
             />
             
             {/* Client specific: Download Button */}
             <div className="absolute bottom-8 flex gap-4">
               <button 
                 onClick={() => window.open(activeMockupUrl, '_blank')}
                 className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-white/20 transition"
               >
                 <Download className="w-4 h-4" /> Download Design
               </button>
             </div>
          </div>
        ) : (
          /* CASE B: Painter's Live Video Feed */
          remoteTrack ? (
            <div className="relative w-full h-full">
              <VideoTrack 
                trackRef={remoteTrack} 
                className="w-full h-full object-contain" 
              />
              
              {/* LASER POINTER (Only render if looking at video) */}
              {laserPosition && (
                <div 
                  className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-red-500 bg-red-500/30 rounded-full animate-ping z-50 pointer-events-none shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                  style={{ 
                    left: `${laserPosition.x * 100}%`, 
                    top: `${laserPosition.y * 100}%` 
                  }}
                />
              )}
            </div>
          ) : (
            /* CASE C: Waiting for Painter */
            <div className="flex flex-col items-center justify-center space-y-4 text-zinc-500">
              <div className="w-12 h-12 border-2 border-t-cyan-500 border-zinc-800 rounded-full animate-spin" />
              <p className="text-sm uppercase tracking-widest font-medium">Waiting for Estimator...</p>
            </div>
          )
        )}
      </div>

      {/* 🔵 PICTURE IN PICTURE: Client's Own Face (Bottom Right) */}
      <div className="absolute bottom-4 right-4 w-28 h-40 md:w-48 md:h-72 bg-zinc-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-40">
        {localTrack ? (
           <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
        ) : (
           <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">
             No Camera
           </div>
        )}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-bold text-white uppercase tracking-wider">
          You
        </div>
      </div>
    </div>
  );
}