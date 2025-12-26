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
import { Maximize2, Sparkles, Mic, MicOff, ListChecks, X } from 'lucide-react';

export const PainterStage = ({ slug }: { slug: string }) => {
  const { 
    laserPosition, 
    sendData, 
    triggerAI, 
    isGenerating, 
    activeMockupUrl,
    isTranscribing,
    toggleTranscription,
    liveScopeItems,
    transcripts
  } = useRoomContext();
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const localTrack = tracks.find(t => t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;
  const remoteTrack = tracks.find(t => !t.participant.isLocal && isTrackReference(t)) as TrackReference | undefined;

  const handlePointer = (e: React.MouseEvent) => {
    if (!containerRef.current || activeMockupUrl) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    sendData('POINTER', { x, y });
  };

  return (
    <div className="flex h-full w-full bg-[#050505] overflow-hidden">
      <RoomAudioRenderer />

      {/* --- MAIN MONITOR AREA --- */}
      <div className="flex-1 relative flex flex-col p-4">
        <div 
          ref={containerRef}
          onClick={handlePointer}
          className="relative flex-1 rounded-3xl overflow-hidden border border-white/5 bg-zinc-950 cursor-crosshair shadow-2xl"
        >
          {/* Main Feed: Client's Property */}
          {remoteTrack ? (
            <VideoTrack trackRef={remoteTrack} className="w-full h-full object-contain" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600">
               <div className="w-8 h-8 border-2 border-t-cyan-500 border-zinc-800 rounded-full animate-spin mb-4" />
               <p className="text-xs font-black uppercase tracking-widest">Connecting to Client Feed...</p>
            </div>
          )}

          {/* Laser Pointer Ping */}
          {laserPosition && (
            <div 
              className="absolute w-10 h-10 -ml-5 -mt-5 border-2 border-cyan-400 rounded-full animate-ping z-50 pointer-events-none"
              style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }}
            />
          )}

          {/* Identity Label */}
          <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Client Property View</span>
          </div>

          {/* AI Mockup Modal Overlay */}
          {activeMockupUrl && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 z-[100] animate-in fade-in zoom-in">
               <img src={activeMockupUrl} className="max-h-[75%] rounded-2xl shadow-2xl border border-white/10" alt="AI Preview" />
               <div className="mt-8 flex gap-4">
                 <button onClick={() => window.open(activeMockupUrl)} className="bg-white text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                   <Maximize2 className="w-4 h-4" /> View Full 8K
                 </button>
                 <button onClick={() => { /* Close logic */ }} className="bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold">Close Preview</button>
               </div>
            </div>
          )}

          {/* HUD Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button 
              disabled={isGenerating || !remoteTrack}
              onClick={() => triggerAI(slug)}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-800 text-black px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl shadow-cyan-500/20"
            >
              {isGenerating ? "AI Rendering..." : "Generate AI Mockup"}
            </button>
          </div>

          {/* Painter PiP (My face) */}
          <div className="absolute bottom-6 right-6 w-40 h-56 rounded-2xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/20">
            {localTrack && <VideoTrack trackRef={localTrack} className="w-full h-full object-cover grayscale-[0.2]" />}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[8px] font-black uppercase text-white">Painter (You)</div>
          </div>
        </div>
      </div>

      {/* --- SIDEBAR: SCOPE & INTELLIGENCE --- */}
      <div className="w-[380px] border-l border-white/5 bg-zinc-950 flex flex-col">
        {/* Transcription Toggle */}
        <div className="p-6 border-b border-white/5 space-y-4">
          <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
             <Mic className="w-3 h-3" /> Voice Intelligence
          </h3>
          <button 
            onClick={toggleTranscription}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              isTranscribing ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white text-black'
            }`}
          >
            {isTranscribing ? (
              <> <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Listening... </>
            ) : (
              <> <Sparkles className="w-4 h-4" /> Start Smart Listen </>
            )}
          </button>
        </div>

        {/* Live Scope List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-6 pb-2">
             <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
               <ListChecks className="w-3 h-3" /> Real-time Scope
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3">
            {liveScopeItems.length === 0 && (
              <div className="text-zinc-600 text-xs italic py-10 text-center">
                AI will extract tasks from your conversation automatically.
              </div>
            )}
            {liveScopeItems.map((item, i) => (
              <div key={i} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl text-zinc-300 text-sm animate-in slide-in-from-right duration-300">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transcripts Overlay */}
        <div className="h-32 p-4 bg-black/40 border-t border-white/5 overflow-y-auto">
            {transcripts.slice(-2).map((t, i) => (
              <p key={i} className="text-[10px] text-zinc-500 mb-1 leading-relaxed">
                <span className="text-cyan-500 uppercase font-black mr-1">{t.sender}:</span> {t.text}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};