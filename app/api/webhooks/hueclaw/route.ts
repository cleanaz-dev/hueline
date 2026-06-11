import { prisma } from "@/lib/prisma";
import { clearHueClawStatus, releaseResourceLock } from "@/lib/redis";
import { NextResponse } from "next/server";

// We'll define these extractors below (or in separate files)
import { processNudgeReturn } from "@/lib/hueclaw/services/process-nudge-return";
import { processImagenReturn } from "@/lib/hueclaw/services/process-imagen-return";
import { processQuoteReturn } from "@/lib/hueclaw/services/process-quote-return";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.LAMBDA_WEBHOOK_SECRET;
  const authHeader = req.headers.get("x-webhook-secret");

  if (authHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let activeLockKey: string | null = null;
  let activeThreadId: string | null = null;

  try {
    const { systemTaskId, result } = await req.json();

    // 1. Fetch & Verify Task
    const task = await prisma.systemTask.findUnique({
      where: { id: systemTaskId },
    });

    if (!task) throw new Error(`System task not found: ${systemTaskId}`);
    activeLockKey = task.lockKey;

    // 2. Mark Completed
    await prisma.systemTask.update({
      where: { id: systemTaskId },
      data: { status: "COMPLETED" },
    });

    // 3. Delegate to specific service handlers
    // Each handler returns instructions on what to do with the lock & UI status
    let outcome: { releaseLock: boolean; threadId: string; message: string };

    switch (task.type) {
      case "NUDGE":
        outcome = await processNudgeReturn(task, result);
        break;
      case "IMAGEN":
        outcome = await processImagenReturn(task, result);
        break;
      case "QUOTE_GENERATION":
        outcome = await processQuoteReturn(task, result);
        break;
      default:
        throw new Error(`Unhandled SystemTask type: ${task.type}`);
    }

    activeThreadId = outcome.threadId;

    // 4. Centralized Cleanup
    // We only release the lock if the flow has reached its absolute end.
    if (outcome.releaseLock) {
      await releaseResourceLock(activeLockKey);
      await clearHueClawStatus(activeThreadId);
      console.log(`[HueClaw] 🔓 Lock released for thread ${activeThreadId}`);
    }

    return NextResponse.json({ success: true, message: outcome.message });

  } catch (error) {
    console.error("[HueClaw] Webhook error:", error);

    // Failsafe: Always release lock on crash
    if (activeLockKey) await releaseResourceLock(activeLockKey);
    if (activeThreadId) await clearHueClawStatus(activeThreadId);

    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}