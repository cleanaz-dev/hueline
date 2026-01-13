// lib/livekit/handlers/room-finished.ts
import { WebhookEvent } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { getRoomScopeData } from "@/lib/redis";

export async function handleRoomFinished(event: WebhookEvent) {
  const { room } = event;
  
  // Safety check to ensure we have a room name to look up
  if (!room?.name) return;

  try {
    console.log(`Processing room_finished for: ${room.name}`);

    // 1. Retrieve the scope data from Redis
    const scopeData = await getRoomScopeData(room.name);

    // 2. Run updates in a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      
      // A. Update the Room: Save scope data and mark processing as done
      const updatedRoom = await tx.room.update({
        where: { roomKey: room.name },
        data: {
          scopeData: scopeData ?? undefined, // Handle null/undefined gracefully
          isProcessing: false,
        },
        select: {
          bookingId: true, // Select the ID directly
        },
      });

      // B. Update the Booking: Mark self-serve flow as complete
      if (updatedRoom.bookingId) {
        await tx.subBookingData.update({
          where: { id: updatedRoom.bookingId },
          data: {
            selfServeCompletion: true,
          },
        });
      }
    });

    console.log(`✅ Saved scope data and completed booking for room: ${room.name}`);
  } catch (error) {
    console.error(`❌ Failed to save room data: ${room.name}`, error);
  }
}