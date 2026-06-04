import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { acquireResourceLock, releaseResourceLock } from "@/lib/redis";
import { handleHueClawComms } from "@/lib/hueclaw/handlers/comms";
// import { handleHueClawImagen } from "@/lib/hueclaw/handlers/imagen";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; threadId: string; trigger: string }> }
) {
  const { threadId, trigger, slug } = await params;

  // 1. Fetch the thread to check Autopilot status
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: { isAutoPilot: true }
  });

  if (!thread || !slug) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  // 2. Auth Check: Must be on Autopilot OR triggered by a valid system Cron
  const authHeader = req.headers.get("authorization");
  const isSystemCron = authHeader === `Bearer ${process.env.HUECLAW_SECRET_KEY}`;

  if (!thread.isAutoPilot && !isSystemCron) {
    return NextResponse.json(
      { message: "Autopilot is disabled for this thread and no valid system token provided." }, 
      { status: 403 }
    );
  }

  // 3. Map trigger to Redis Lock Context
  const contextMap: Record<string, "COMMS" | "IMAGEN" | "QUOTE" | "UPSCALE"> = {
    comms: "COMMS",
    imagen: "IMAGEN",
  };
  
  const lockContext = contextMap[trigger];
  if (!lockContext) {
    return NextResponse.json({ error: `Unknown trigger: ${trigger}` }, { status: 400 });
  }

  // 4. Lock the Chat Thread
  const lockKey = await acquireResourceLock(threadId, lockContext);
  if (!lockKey) {
    return NextResponse.json({ message: "AI is already processing this thread..." }, { status: 409 });
  }

  try {
    const body = await req.json().catch(() => ({})); 

    // 5. Route to the correct handler
    switch (trigger) {
      case "comms":
        await handleHueClawComms(threadId, lockKey, body);
        break;
      
      case "imagen":
        // await handleHueClawImagen(threadId, lockKey, body);
        break;
    }

    return NextResponse.json({ 
      message: `Hue-Claw [${trigger}] dispatched for thread ${threadId}`,
      lockKey 
    });

  } catch (error) {
    console.error(`[HueClaw Router] Error on ${trigger}:`, error);
    await releaseResourceLock(lockKey);
    return NextResponse.json({ error: "Failed to dispatch AI" }, { status: 500 });
  }
}