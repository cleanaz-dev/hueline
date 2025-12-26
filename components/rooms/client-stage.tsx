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

export const ClientStage = ({ slug }: { slug: string }) => {
  const { 
    laserPosition, 
    activeMockupUrl,
    liveScopeItems,
    transcripts 
  } = useRoomContext();
  
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const localTrack = tracks.find(t => t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;
  const remoteTrack = tracks.find(t => !t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <RoomAudioRenderer />

      {/* 1. MAIN CAMERA (Client's Property) */}
      {localTrack ? (
        <VideoTrack trackRef={localTrack} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
          Initializing Camera...
        </div>
      )}

      {/* 2. PAINTER PiP (Small floating window) */}
      {remoteTrack && (
        <div className="absolute top-4 right-4 w-28 h-40 rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-40 bg-zinc-900">
          <VideoTrack trackRef={remoteTrack} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-black uppercase text-white">
            Pro Painter
          </div>
        </div>
      )}

      {/* 3. LASER POINTER (Sync'd from Painter's clicks) */}
      {laserPosition && (
        <div 
          className="absolute w-12 h-12 -ml-6 -mt-6 border-4 border-cyan-400 rounded-full animate-ping z-50 pointer-events-none"
          style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }}
        />
      )}

      {/* 4. LIVE SCOPE NOTIFICATIONS (Toasts) */}
      <div className="absolute bottom-24 left-4 right-4 z-50 pointer-events-none">
        <div className="flex flex-col-reverse gap-2">
          {liveScopeItems.slice(-2).map((item, i) => (
            <div key={i} className="bg-cyan-500 text-black px-4 py-3 rounded-2xl font-black text-xs shadow-xl animate-in slide-in-from-bottom duration-500 flex items-center gap-3">
               <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
               NEW TASK: {item}
            </div>
          ))}
        </div>
      </div>

      {/* 5. AI MOCKUP (Full screen reveal) */}
      {activeMockupUrl && (
        <div className="absolute inset-0 z-[100] bg-black animate-in fade-in zoom-in duration-500 p-4 flex flex-col items-center justify-center">
          <img src={activeMockupUrl} className="max-h-[80%] rounded-2xl shadow-2xl" alt="AI Preview" />
          <p className="mt-6 text-white font-black uppercase tracking-widest text-sm">New Vision Generated</p>
          <button 
            onClick={() => {/* Close logic in context */}}
            className="mt-6 bg-white text-black px-8 py-3 rounded-full font-bold uppercase text-xs"
          >
            Back to Camera
          </button>
        </div>
      )}

      {/* 6. CAPTIONS / TRANSCRIPT */}
      <div className="absolute bottom-10 left-0 right-0 px-8 text-center z-40 pointer-events-none">
        {transcripts.length > 0 && (
          <p className="inline-block px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-medium animate-in fade-in duration-300">
            {transcripts[transcripts.length - 1].text}
          </p>
        )}
      </div>

      {/* Visual Indicator: Status */}
      <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Live Survey</span>
      </div>
    </div>
  );
};