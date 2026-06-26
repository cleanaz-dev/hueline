import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher/pusher-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { threadId, text, isFinal, role } = body;
    // role: "CLIENT" or "AI"

    if (!threadId || !text) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 1. Push the live text to the Frontend UI instantly
    await pusherServer.trigger(`thread-${threadId}`, "live-transcript", {
      text,
      isFinal,
      role,
    });

    console.log(`[LIVE AUDIO] ${role}: ${text}`);

    // 2. NO DB SAVE FOR NOW - Just purely testing the real-time pipe!
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[LiveKit Transcript Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}