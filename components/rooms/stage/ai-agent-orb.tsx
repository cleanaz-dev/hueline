"use client";

import { useEffect, useRef } from "react";
import { TrackPublication, LocalParticipant, RemoteParticipant } from "livekit-client";
import { useTrackVolume } from "@livekit/components-react";
import { motion } from "framer-motion";

interface AgentOrbProps {
  trackPublication?: TrackPublication;
  participant?: RemoteParticipant | LocalParticipant;
}

export const AgentOrb = ({ trackPublication, participant }: AgentOrbProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const siriWaveRef = useRef<any>(null);
  const volume = useTrackVolume(trackPublication as any);
  
  const amplitude = volume > 0.01 ? volume * 3 : 0.1;

  // Safety check - don't render if no participant
  if (!participant) return null;

  useEffect(() => {
    import('siriwave').then((SiriWave) => {
      if (containerRef.current && !siriWaveRef.current) {
        siriWaveRef.current = new SiriWave.default({
          container: containerRef.current,
          style: 'ios9',
          width: 200,
          height: 200,
          speed: 0.03,
          amplitude: 0.5,
          frequency: 6,
          color: '#8b5cf6',
          cover: true,
          autostart: true,
          pixelDepth: 0.01,
          lerpSpeed: 0.1,
        });
      }
    });

    return () => {
      if (siriWaveRef.current) {
        siriWaveRef.current.dispose();
        siriWaveRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (siriWaveRef.current) {
      siriWaveRef.current.setAmplitude(amplitude);
    }
  }, [amplitude]);

  // Check if participant is connected
  const isConnected = participant.connectionQuality !== 'lost';

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        ref={containerRef}
        className="relative"
        style={{ width: 200, height: 200 }}
        animate={{
          scale: volume > 0.02 ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      
      {/* Connection status - now using participant state */}
      <div className="absolute -bottom-2 -right-2">
        <span className="relative flex h-3 w-3">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 border border-white ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </span>
      </div>
    </div>
  );
};