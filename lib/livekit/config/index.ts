import { EgressClient } from 'livekit-server-sdk'

export const egressClient = new EgressClient(
  process.env.LIVEKIT_VIDEO_URL!,
  process.env.LIVEKIT_VIDEO_API_KEY!,
  process.env.LIVEKIT_VIDEO_API_SECRET!
);
