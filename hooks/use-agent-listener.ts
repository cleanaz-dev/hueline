import { useParticipants, useTracks } from "@livekit/components-react";
import { Participant, Track } from "livekit-client";
import { useMemo } from "react";

export const useAgentListener = () => {
  // 1. Get all participants
  const participants = useParticipants();

  // 2. Find the agent (Identity starts with "agent")
  // The server code dispatched it with the name "agent", but LiveKit might append an ID.
  const agentParticipant = useMemo(() => {
    return participants.find((p) => p.identity.startsWith("agent"));
  }, [participants]);

  // 3. Get the Agent's Audio Track specifically
  // We use useTracks to ensure we are subscribed to it
  const audioTracks = useTracks([Track.Source.Microphone]);
  
  const agentAudioTrack = useMemo(() => {
    if (!agentParticipant) return undefined;
    
    return audioTracks.find(
      (t) => t.participant.identity === agentParticipant.identity
    )?.publication;
  }, [audioTracks, agentParticipant]);

  return {
    agentParticipant,
    agentAudioTrack,
    isAgentConnected: !!agentParticipant,
  };
};