// lib/handlers/livekit-voice-room-ended.ts
import { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { clearHueClawStatus } from "@/lib/redis";
import { getTranscript, deleteTranscript } from "@/lib/redis/agent-context";
import { pusherServer } from "@/lib/pusher/pusher-server";

export async function handleLiveKitVoiceRoomEnded(roomName: string) {
  try {
    const currentCall = await prisma.call.findFirst({
      where: { roomName },
      select: { id: true, threadId: true },
    });

    if (!currentCall || !currentCall.id || !currentCall.threadId) {
      console.warn(
        `⚠️ [RoomEnded] Could not find Call record for roomName: ${roomName}`,
      );
      return;
    }

    const transcript = await getTranscript(currentCall.id);

    if (!transcript || transcript.length === 0) {
      console.warn(
        `ℹ️ [RoomEnded] No transcript lines found in Redis for Call ID: ${currentCall.id}`,
      );
    }

    await prisma.call.update({
      where: { id: currentCall.id },
      data: {
        transcript: transcript as unknown as Prisma.InputJsonValue,
        status: "ENDED",
      },
    });

    await deleteTranscript(currentCall.id);

    console.log(
      `✅ [RoomEnded] Saved complete transcript for Call ID: ${currentCall.id}`,
    );

    await pusherServer.trigger(`thread-${currentCall.threadId}`, "call-ended", {
      callId: currentCall.id,
    });

    await clearHueClawStatus(currentCall.threadId!);

    // 🧠 invokeCallIntelligenceLambda(currentCall.id);
  } catch (error) {
    console.error(
      `❌ [RoomEnded] Failed to process room_ended for ${roomName}:`,
      error,
    );
  }
}