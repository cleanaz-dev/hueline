import { EgressClient } from "livekit-server-sdk";
import { RoomServiceClient } from "livekit-server-sdk";

export const egressClient = new EgressClient(
  process.env.LIVEKIT_VIDEO_URL!,
  process.env.LIVEKIT_VIDEO_API_KEY!,
  process.env.LIVEKIT_VIDEO_API_SECRET!,
);

export const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);
