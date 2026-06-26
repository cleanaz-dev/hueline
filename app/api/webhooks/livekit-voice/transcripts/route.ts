import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/pusher-server";
import { prisma } from "@/lib/prisma";
import { appendTranscriptLine } from "@/lib/redis/agent-context";

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

    // 2. Only save finalized sentences to Redis to avoid spam
    if (isFinal) {
      const currentCall = await prisma.call.findFirst({
        where: { threadId, status: "PROCESSING" },
        select: { id: true },
      });

      if (currentCall) {
        await appendTranscriptLine(currentCall.id, {
          role,
          text,
          timestamp: new Date().toISOString(),
        });
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