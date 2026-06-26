import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/pusher-server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis"; // <-- Assuming this is your Redis client

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { threadId, text, isFinal, role } = body;
    // role: "CLIENT" or "AI"

    if (!threadId || !text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 1. Instantly push to UI via Pusher (for BOTH partial and final text)
    await pusherServer.trigger(`thread-${threadId}`, "live-transcript", {
      text,
      isFinal,
      role,
    });

    // 2. Only save finalized sentences to the DB/Redis to avoid spam
    if (isFinal) {
      const currentCall = await prisma.call.findFirst({
        where: { threadId, status: "PROCESSING" }, // Or whatever your active status is
        select: { id: true }
      });

      if (currentCall) {
        const redis = await getRedisClient();
        const redisKey = `live_transcript:${currentCall.id}`;

        const transcriptLine = JSON.stringify({
          role,
          text,
          timestamp: new Date().toISOString(),
        });

        // Atomically push to the end of the Redis list (Blazing fast, no race conditions)
        await redis.rpush(redisKey, transcriptLine);
        
        // Optional: Set an expiration just in case the call ends weirdly (e.g., 2 hours)
        await redis.expire(redisKey, 7200); 
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LiveKit Transcript Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}