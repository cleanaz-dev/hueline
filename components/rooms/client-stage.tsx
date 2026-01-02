'use client';

import React from 'react';
import { useRoomContext } from '@/context/room-context';
import { 
  VideoTrack, useTracks, RoomAudioRenderer, isTrackReference 
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Download, VideoOff, Wifi, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClientStage() {
  const { 
    laserPosition, 
    activeMockupUrl, 
    room,
    isTranscribing, // Assuming you might want to show recording status
    toggleTranscription 
  } = useRoomContext();

  // 1. Get Tracks & Filter
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const validTracks = tracks.filter(isTrackReference);
  
  const localTrack = validTracks.find(t => t.participant.isLocal);
  const remoteTrack = validTracks.find(t => !t.participant.isLocal);

  // 2. Determine Logic
  // If the Painter (remote) is sending video, they are the focus.
  // If not, we fallback to the Client's own camera (Viewfinder mode).
  const mainVideoTrack = remoteTrack || localTrack;
  const isLocalMain = !remoteTrack && !!localTrack; // True if we are looking at ourselves
  
  // Show PIP only if we have a remote painter AND our own camera is on
  const showPip = !!(remoteTrack && localTrack);

  return (
    /** 
     * ROOT CONTAINER: 
     * - fixed inset-0: Breaks out of parent divs.
     * - h-[100dvh]: Matches mobile screen height exactly (ignoring URL bars).
     * - z-[9999]: Sits on top of headers/sidebars.
     * - touch-none: Prevents dragging the webpage around on iOS.
     */
    <div className="fixed inset-0 w-screen h-[100dvh] bg-black z-[9999] flex flex-col overflow-hidden overscroll-none touch-none">
      <RoomAudioRenderer />

      {/* --- MAIN CONTENT LAYER --- */}
      <div className="absolute inset-0 w-full h-full">
        {activeMockupUrl ? (
          // SCENARIO A: AI MOCKUP (Image Mode)
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 animate-in fade-in zoom-in-95">
             <img 
               src={activeMockupUrl} 
               className="w-full h-full object-contain p-4" // Padding ensures UI doesn't overlap art
               alt="Design Proposal" 
             />
             
             {/* Floating Action Button for Mockup */}
             <div className="absolute bottom-12 left-0 right-0 flex justify-center pb-safe">
               <button 
                 onClick={() => window.open(activeMockupUrl, '_blank')}
                 className="bg-white text-black font-bold px-8 py-4 rounded-full shadow-xl flex items-center gap-3 active:scale-95 transition-transform"
               >
                 <Download size={20} /> 
                 <span>Save Design</span>
               </button>
             </div>
          </div>
        ) : (
          // SCENARIO B: LIVE VIDEO
          mainVideoTrack ? (
            <div className="relative w-full h-full">
              {/* VIDEO FEED */}
              <VideoTrack 
                trackRef={mainVideoTrack} 
                className={cn(
                  "w-full h-full",
                  // If looking at self (Viewfinder), fill screen (cover). 
                  // If looking at Painter (Content), show all pixels (contain).
                  isLocalMain ? "object-cover" : "object-contain bg-zinc-950"
                )} 
              />
              
              {/* LASER POINTER OVERLAY */}
              {/* Only show laser if we are looking at the room (Local Main) or if Painter is pointing at their own feed */}
              {laserPosition && (
                <div 
                  className="absolute w-12 h-12 border-4 border-red-500 bg-red-500/20 rounded-full animate-ping pointer-events-none z-20 shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                  style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }}
                />
              )}
            </div>
          ) : (
             // SCENARIO C: NO VIDEO (Fallback)
             <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 gap-6">
                <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center animate-pulse">
                    <VideoOff className="w-10 h-10 opacity-50" />
                </div>
                <div className="text-center px-6">
                    <p className="text-lg font-medium text-zinc-300">Camera Off</p>
                    <p className="text-sm mt-2">Waiting for video signal...</p>
                </div>
             </div>
          )
        )}
      </div>

      {/* --- UI OVERLAY LAYER (Safe Area Aware) --- */}
      
      {/* 1. Status Badge (Top Left) */}
      <div className="absolute top-safe-offset left-4 pt-14 z-30"> 
        {/* pt-14 pushes it below standard mobile status bars if needed, adjust based on your layout */}
        <div className="flex flex-col gap-2 items-start">
            <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-sm",
                room?.state === 'connected' 
                    ? "bg-black/40 border-green-500/30 text-green-400" 
                    : "bg-black/40 border-red-500/30 text-red-400"
            )}>
                <Wifi size={14} className={cn(room?.state === 'connected' && "")} />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                    {room?.state === 'connected' ? 'Live' : 'Connecting'}
                </span>
            </div>

            {/* Audio Only Warning */}
            {isLocalMain && room?.state === 'connected' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-medium text-white">Estimator Listening...</span>
                </div>
            )}
        </div>
      </div>

      {/* 2. PIP Window (Bottom Right) */}
      {/* Only show if we are watching the painter (Remote) but still sending our video */}
      {showPip && localTrack && (
        <div className="absolute top-4 right-4 w-[25vw] max-w-[120px] aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-30 bg-black">
           <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
        </div>
      )}

      {/* 3. Controls (Bottom Center) - Optional */}
      {/* Add Mic controls or Hangup here if needed */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center pointer-events-none">
         {/* Placeholder for future controls - ensure pointer-events-auto is on buttons */}
      </div>

    </div>
  );
}