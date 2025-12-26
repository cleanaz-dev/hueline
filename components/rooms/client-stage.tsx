'use client';

import React from 'react';
import { useRoomContext } from '@/context/room-context';
import { 
  VideoTrack, useTracks, RoomAudioRenderer, isTrackReference 
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Download } from 'lucide-react';

export function ClientStage() {
  const { laserPosition, activeMockupUrl } = useRoomContext();

  // 1. Get Tracks & Filter
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const validTracks = tracks.filter(isTrackReference);
  
  const localTrack = validTracks.find(t => t.participant.isLocal);
  const remoteTrack = validTracks.find(t => !t.participant.isLocal);

  return (
    <div className="relative h-full w-full flex flex-col bg-black">
      <RoomAudioRenderer />

      <div className="flex-1 relative w-full h-full flex items-center justify-center">
        {/* Priority 1: AI Mockup */}
        {activeMockupUrl ? (
          <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center animate-in fade-in">
             <img src={activeMockupUrl} className="max-h-full max-w-full object-contain" alt="Design" />
             <div className="absolute bottom-10">
               <button 
                 onClick={() => window.open(activeMockupUrl, '_blank')}
                 className="bg-black/60 border border-white/20 text-white px-6 py-3 rounded-full flex gap-2 hover:bg-black/80"
               >
                 <Download size={16} /> Download Design
               </button>
             </div>
          </div>
        ) : (
          /* Priority 2: Painter Video */
          remoteTrack ? (
            <div className="relative w-full h-full">
              <VideoTrack trackRef={remoteTrack} className="w-full h-full object-contain" />
              {laserPosition && (
                <div 
                  className="absolute w-8 h-8 border-2 border-red-500 bg-red-500/30 rounded-full animate-ping pointer-events-none transition-all duration-75"
                  style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }}
                />
              )}
            </div>
          ) : (
             <div className="text-zinc-500">Waiting for Estimator video...</div>
          )
        )}
      </div>

      {/* PIP: Client Face */}
      <div className="absolute bottom-4 right-4 w-28 h-40 bg-zinc-900 rounded-lg overflow-hidden border border-white/10 z-20">
        {localTrack && <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />}
      </div>
    </div>
  );
}