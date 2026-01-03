// lib/livekit/handlers/participant-left.ts
import { WebhookEvent } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { RoomServiceClient } from "livekit-server-sdk";

export async function handleParticipantLeft(event: WebhookEvent) {
  const { participant, room } = event;

  if (!participant?.identity || !room?.name) return;

  const isHost = participant.identity.startsWith("host-");

  console.log(`👋 ${participant.identity} left ${room.name}`);

  // If host leaves, close the room immediately
  if (isHost) {
    console.log(`🔴 Host left ${room.name}. Closing room...`);

    const apiKey = process.env.LIVEKIT_VIDEO_API_KEY!;
    const apiSecret = process.env.LIVEKIT_VIDEO_API_SECRET!;
    const wsUrl = process.env.LIVEKIT_VIDEO_URL!;

    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);

    try {
      // Delete the room from LiveKit
      await roomService.deleteRoom(room.name);
      console.log(`✅ Room ${room.name} deleted from LiveKit`);

      // Update database
      await prisma.room.update({
        where: { roomKey: room.name },
        data: {
          status: "COMPLETED",
          endedAt: new Date()
        }
      });
      console.log(`✅ Room ${room.name} marked as ENDED in DB`);

    } catch (error) {
      console.error(`❌ Failed to close room ${room.name}:`, error);
    }
  }
}