//lib/livekit/handlers/room-finished.ts
import { WebhookEvent } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { getRoomScopeData } from "@/lib/redis";

export async function handleRoomFinished(event: WebhookEvent) {
  const { room } = event;
  if (!room?.name) return;

  try {
    const scopeData = await getRoomScopeData(room.name);

    await prisma.room.update({
      where: { roomKey: room.name },
      data: {
        scopeData: scopeData
      }
    });

    console.log(`✅ Saved scope data for room: ${room.name}`);
  } catch (error) {
    console.error(`❌ Failed to save room: ${room.name} scope data`, error);
  }
}