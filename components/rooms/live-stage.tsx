'use client';

import React, { useRef, useState } from 'react'; // 1. Import useState
import { useRoomContext } from '@/context/room-context';
import { VideoTrack, useTracks, isTrackReference, type TrackReference } from '@livekit/components-react';
import { Track } from 'livekit-client';
// 2. Import Icons
import { Maximize2, Camera, Sparkles, X, Mic, FileText, Loader2, CheckCircle2 } from 'lucide-react';

interface LiveStageProps {
  slug: string;
}

export const LiveStage = ({ slug }: LiveStageProps) => {
  const { 
    laserPosition, 
    sendData, 
    isPainter, 
    triggerAI, 
    isGenerating, 
    activeMockupUrl,
    // 3. Destructure new context values
    transcripts,
    isTranscribing,
    toggleTranscription 
  } = useRoomContext();
  
  // --- NEW STATE FOR SCOPE GENERATION ---
  const [scopeItems, setScopeItems] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showScope, setShowScope] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // --- NEW FUNCTION: TRIGGER THE BRAIN ---
  const handleGenerateScope = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent laser pointer trigger
    
    if (transcripts.length === 0) {
      alert("No conversation detected yet. Turn on 'Listen' and talk first!");
      return;
    }

    setIsAnalyzing(true);
    setShowScope(true);

    try {
      const res = await fetch(`/api/subdomain/${slug}/analyze-conversation`, {
        method: 'POST',
        body: JSON.stringify({ transcripts }),
      });
      
      const data = await res.json();
      if (data.items) {
        setScopeItems(data.items);
      }
    } catch (err) {
      console.error("Failed to generate scope", err);
      alert("Failed to generate scope. Check console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center p-4">
      
      <div 
        ref={containerRef} 
        onClick={handlePointer} 
        className="relative w-full max-w-5xl aspect-video bg-zinc-950 rounded-3xl overflow-hidden cursor-crosshair border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* --- VIDEO RENDERING (unchanged) --- */}
        {isPainter ? (
          remoteTrack ? <VideoTrack trackRef={remoteTrack} className="w-full h-full object-cover" /> : 
          <div className="flex flex-col items-center justify-center h-full text-zinc-600"><div className="w-12 h-12 border-2 border-zinc-800 border-t-cyan-500 rounded-full animate-spin mb-4" /><p>Waiting for Client...</p></div>
        ) : (
          localTrack ? <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" /> : 
          <div className="flex flex-col items-center justify-center h-full text-zinc-600"><Camera className="w-12 h-12 mb-4 opacity-20" /><p>Initializing camera...</p></div>
        )}

        {/* --- EXISTING OVERLAYS (Laser, Mockup) --- */}
        {laserPosition && (
          <div className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-cyan-400 rounded-full animate-ping shadow-[0_0_20px_cyan] z-30" style={{ left: `${laserPosition.x * 100}%`, top: `${laserPosition.y * 100}%` }} />
        )}
        
        {activeMockupUrl && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500 z-50">
             <div className="relative max-w-full max-h-[85%] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                <img src={activeMockupUrl} className="w-full h-full object-contain" alt="AI Mockup" />
             </div>
             <div className="mt-6 flex gap-3">
               <button onClick={(e) => { e.stopPropagation(); window.open(activeMockupUrl); }} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"><Maximize2 className="w-4 h-4" /> Export 8K</button>
               <button onClick={(e) => { e.stopPropagation(); /* Close logic */ }} className="bg-zinc-800 text-white px-8 py-3 rounded-full font-bold border border-white/10 hover:bg-zinc-700 transition-all">Close</button>
             </div>
          </div>
        )}

        {/* --- NEW OVERLAY: LIVE CAPTIONS --- */}
        {isTranscribing && transcripts.length > 0 && (
          <div className="absolute bottom-28 left-0 w-full flex justify-center pointer-events-none z-20">
            <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 max-w-xl text-center">
              <span className="text-cyan-400 font-bold text-xs uppercase mr-2 tracking-widest">
                {transcripts[transcripts.length - 1].sender === 'local' ? 'YOU' : 'CLIENT'}:
              </span>
              <span className="text-white text-sm font-medium">
                {transcripts[transcripts.length - 1].text}
              </span>
            </div>
          </div>
        )}

        {/* --- NEW OVERLAY: SCOPE OF WORK LIST --- */}
        {showScope && (
          <div className="absolute top-4 right-4 w-80 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 z-40 shadow-2xl animate-in slide-in-from-right-10">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
              <h3 className="text-white font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> 
                Scope of Work
              </h3>
              <button onClick={(e) => {e.stopPropagation(); setShowScope(false)}} className="text-zinc-500 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAnalyzing ? (
              <div className="py-10 flex flex-col items-center text-zinc-500 text-sm">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-cyan-500" />
                <p>Analyzing conversation...</p>
                <p className="text-xs text-zinc-600 mt-1">Consulting GPT-5.2</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {scopeItems.length > 0 ? (
                  <ul className="space-y-3">
                    {scopeItems.map((item, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-500 text-sm text-center py-4">
                    No action items found yet. Keep discussing the project details!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- PAINTER HUD (UPDATED CONTROLS) --- */}
        {isPainter && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4">
            
            {/* 1. VISUALIZE */}
            <button 
              disabled={isGenerating || !remoteTrack}
              onClick={(e) => { e.stopPropagation(); triggerAI(slug); }}
              className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:border-cyan-500/50"
              title="Generate Mockup"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Sparkles className="w-5 h-5 text-cyan-400" />}
            </button>

            {/* 2. TRANSCRIBE (EARS) */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleTranscription(); }}
              className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg border ${
                isTranscribing 
                  ? 'bg-red-500/20 border-red-500 text-red-500' 
                  : 'bg-zinc-900 border-white/10 text-white hover:border-white/30'
              }`}
              title={isTranscribing ? "Stop Listening" : "Start Listening"}
            >
              <Mic className={`w-5 h-5 ${isTranscribing ? 'animate-pulse' : ''}`} />
            </button>

            {/* 3. GENERATE SCOPE (BRAIN) */}
            <button 
              onClick={handleGenerateScope}
              className="h-12 px-6 bg-white text-black rounded-full font-bold text-sm flex items-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all shadow-xl"
            >
              <FileText className="w-4 h-4" />
              Build Scope
            </button>

          </div>
        )}

      </div>
    </div>
  );
};