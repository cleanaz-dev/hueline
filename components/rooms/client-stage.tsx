'use client';

import React from 'react';
import { useRoomContext } from '@/context/room-context';
import { 
  VideoTrack, useTracks, RoomAudioRenderer, isTrackReference 
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Download, VideoOff } from 'lucide-react';

export function ClientStage() {
  const { laserPosition, activeMockupUrl } = useRoomContext();

  // 1. Get Tracks & Filter
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const validTracks = tracks.filter(isTrackReference);
  
  const localTrack = validTracks.find(t => t.participant.isLocal);
  const remoteTrack = validTracks.find(t => !t.participant.isLocal);

  // LOGIC: If remote (Painter) is present, they are Main. 
  // If Painter is missing/audio-only, Local (Client) becomes Main.
  const mainVideoTrack = remoteTrack || localTrack;
  
  // Only show PIP if we have BOTH tracks. 
  // If we are falling back to local-only, we don't want a PIP of ourselves on top of ourselves.
  const showPip = !!(remoteTrack && localTrack);

  return (
    <div className="relative h-full w-full flex flex-col bg-black">
      <RoomAudioRenderer />

      <div className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Priority 1: AI Mockup */}
        {activeMockupUrl ? (
          <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center animate-in fade-in z-30">
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
          /* Priority 2: Video Feed (Painter OR Client Fallback) */
          mainVideoTrack ? (
            <div className="relative w-full h-full">
              {/* The Main Video */}
              <VideoTrack 
                trackRef={mainVideoTrack} 
                className="w-full h-full object-contain" 
              />
              
              {/* Laser Pointer - Only show if we are looking at the Client's feed (which is usually where pointers happen) */}
              {laserPosition && (
                <div 
                  className="absolute w-8 h-8 border-2 border-red-500 bg-red-500/30 rounded-full animate-ping pointer-events-none transition-all duration-75 z-10"
                  style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }}
                />
              )}
            </div>
          ) : (
            /* Priority 3: No Camera from ANYONE */
             <div className="flex flex-col items-center justify-center text-zinc-500 gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 opacity-50" />
                </div>
                <p>Camera is off</p>
             </div>
          )
        )}
      </div>

      {/* PIP: Only shows if Painter is Main, then we show Client in corner. */}
      {showPip && localTrack && (
        <div className="absolute bottom-4 right-4 w-28 h-40 bg-zinc-900 rounded-lg overflow-hidden border border-white/10 z-20 shadow-2xl">
           <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* If Painter is hidden (Audio only) but Client is Main, show a small indicator that Painter is there */}
      {!remoteTrack && localTrack && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
            <span className="text-xs text-white font-medium">Estimator Connected (Audio Only)</span>
          </div>
      )}
    </div>
  );
}