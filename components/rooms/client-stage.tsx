'use client';

import React from 'react';
import { useRoomContext } from '@/context/room-context';
import { 
  VideoTrack, 
  useTracks, 
  RoomAudioRenderer, 
  isTrackReference, 
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Download } from 'lucide-react';

export function ClientStage() {
  const { 
    laserPosition, 
    activeMockupUrl, 
    liveScopeItems 
  } = useRoomContext();

  // 1. Get raw tracks (mix of refs and placeholders)
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false }
  ]);

  // 2. FILTER: Narrow the type to ensure we only have valid TrackReferences
  // This removes 'TrackReferencePlaceholder' from the type definition
  const validTracks = tracks.filter(isTrackReference);

  // 3. Select specific tracks
  const localTrack = validTracks.find(t => t.participant.isLocal);
  const remoteTrack = validTracks.find(t => !t.participant.isLocal);

  return (
    <div className="relative h-full w-full bg-black flex flex-col overflow-hidden">
      <RoomAudioRenderer />

      {/* --- MAIN STAGE --- */}
      <div className="flex-1 relative w-full h-full flex items-center justify-center">
        
        {activeMockupUrl ? (
          <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center animate-in fade-in duration-500">
             <img 
               src={activeMockupUrl} 
               className="max-h-full max-w-full object-contain p-4" 
               alt="Design Proposal" 
             />
             <div className="absolute bottom-8 z-50">
               <button 
                 onClick={() => window.open(activeMockupUrl, '_blank')}
                 className="bg-black/50 backdrop-blur border border-white/20 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-black/70 transition"
               >
                 <Download className="w-4 h-4" /> Download Design
               </button>
             </div>
          </div>
        ) : (
          remoteTrack ? (
            <div className="relative w-full h-full">
              {/* remoteTrack is now guaranteed to be TrackReference */}
              <VideoTrack 
                trackRef={remoteTrack} 
                className="w-full h-full object-contain" 
              />
              
              {laserPosition && (
                <div 
                  className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-red-500 bg-red-500/30 rounded-full animate-ping z-50 pointer-events-none shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-75"
                  style={{ 
                    left: `${laserPosition.x * 100}%`, 
                    top: `${laserPosition.y * 100}%` 
                  }}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500">
              <div className="w-8 h-8 border-2 border-t-transparent border-white rounded-full animate-spin mb-4" />
              <p>Waiting for Estimator's video...</p>
            </div>
          )
        )}
      </div>

      {/* --- PIP: Client's own face --- */}
      <div className="absolute bottom-4 right-4 w-28 h-40 bg-zinc-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-40">
        {localTrack ? (
           <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
        ) : (
           <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600 text-[10px]">
             No Cam
           </div>
        )}
      </div>
    </div>
  );
}