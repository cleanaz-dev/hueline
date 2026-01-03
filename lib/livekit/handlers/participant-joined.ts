// lib/livekit/handlers/participant-joined.ts
import { WebhookEvent } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { startRoomRecording } from "@/lib/livekit/services/egress-service";

export async function handleParticipantJoined(event: WebhookEvent) {
  const { participant, room } = event;

  if (!participant?.identity || !room?.name) return;

  const isHost = participant.identity.startsWith("host-");

  console.log(`👤 ${participant.identity} joined ${room.name}`);

  // Start recording when host joins
  if (isHost) {
    console.log(`🎥 Host joined ${room.name}. Starting recording...`);

    const dbRoom = await prisma.room.findUnique({
      where: { roomKey: room.name },
      select: { domainId: true }
    });

    if (dbRoom?.domainId) {
      await startRoomRecording(room.name, dbRoom.domainId);
      console.log(`✅ Recording started for ${room.name}`);
    }
  }
}