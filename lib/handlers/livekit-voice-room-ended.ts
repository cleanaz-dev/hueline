// lib/handlers/livekit-voice-room-ended.ts
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";

export async function handleLiveKitVoiceRoomEnded(roomName: string) {
  try {
    const currentCall = await prisma.call.findFirst({
      where: { roomName },
      select: { id: true, threadId: true },
    });

    if (!currentCall) {
      console.warn(`⚠️ [RoomEnded] Could not find Call record for roomName: ${roomName}`);
      return;
    }

    const redis = await getRedisClient();
    const redisKey = `live_transcript:${currentCall.id}`;

    const rawTranscriptList = (await redis.lrange(redisKey, 0, -1)) as string[];  // ✅

    if (!rawTranscriptList || rawTranscriptList.length === 0) {
      console.log(`ℹ️ [RoomEnded] No transcript lines found in Redis for Call ID: ${currentCall.id}`);
      return;
    }

    const finalTranscriptArray = rawTranscriptList.map((line) => JSON.parse(line));

    await prisma.call.update({
      where: { id: currentCall.id },
      data: {
        transcript: finalTranscriptArray,
        status: "ENDED",
      },
    });

    await redis.del(redisKey);

    console.log(`✅ [RoomEnded] Saved complete transcript for Call ID: ${currentCall.id}`);

    // 🧠 invokeCallIntelligenceLambda(currentCall.id);

  } catch (error) {
    console.error(`❌ [RoomEnded] Failed to process room_ended for ${roomName}:`, error);
  }
}