import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { acquireResourceLock, releaseResourceLock } from "@/lib/redis";
import { handleHueClawComms } from "@/lib/hueclaw/handlers/comms";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; threadId: string; trigger: string }> }
) {
  const { threadId, trigger, slug } = await params;
  console.log(`[HueClaw] ▶ ${trigger.toUpperCase()} — thread: ${threadId} slug: ${slug}`);

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    select: { isAutoPilot: true }
  });

  if (!thread || !slug) {
    console.warn(`[HueClaw] ✗ Thread not found — threadId: ${threadId}`);
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const authHeader = req.headers.get("authorization");
  const isSystemCron = authHeader === `Bearer ${process.env.HUECLAW_SECRET_KEY}`;

  if (!thread.isAutoPilot && !isSystemCron) {
    console.warn(`[HueClaw] ✗ Unauthorized — autopilot: ${thread.isAutoPilot} cron: ${isSystemCron}`);
    return NextResponse.json(
      { message: "Autopilot is disabled for this thread and no valid system token provided." },
      { status: 403 }
    );
  }

  const contextMap: Record<string, "COMMS" | "IMAGEN" | "QUOTE" | "UPSCALE"> = {
    comms: "COMMS",
    imagen: "IMAGEN",
  };

  const lockContext = contextMap[trigger];
  if (!lockContext) {
    console.warn(`[HueClaw] ✗ Unknown trigger: ${trigger}`);
    return NextResponse.json({ error: `Unknown trigger: ${trigger}` }, { status: 400 });
  }

  const lockKey = await acquireResourceLock(threadId, lockContext);
  if (!lockKey) {
    console.warn(`[HueClaw] ⏳ Already processing — thread: ${threadId} context: ${lockContext}`);
    return NextResponse.json({ message: "AI is already processing this thread..." }, { status: 409 });
  }

  console.log(`[HueClaw] 🔒 Lock acquired — key: ${lockKey}`);

  try {
    const body = await req.json().catch(() => ({}));

    switch (trigger) {
      case "comms":
        await handleHueClawComms(threadId, lockKey, body);
        break;

      case "imagen":
        // await handleHueClawImagen(threadId, lockKey, body);
        break;
    }

    console.log(`[HueClaw] ✓ Dispatched — trigger: ${trigger} thread: ${threadId}`);
    return NextResponse.json({
      message: `Hue-Claw [${trigger}] dispatched for thread ${threadId}`,
      lockKey
    });

  } catch (error) {
    console.error(`[HueClaw] ✗ Handler error — trigger: ${trigger} thread: ${threadId}`, error);
    await releaseResourceLock(lockKey);
    return NextResponse.json({ error: "Failed to dispatch AI" }, { status: 500 });
  }
}