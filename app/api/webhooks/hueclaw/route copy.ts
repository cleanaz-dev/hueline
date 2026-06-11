import { prisma } from "@/lib/prisma";
import { clearHueClawStatus, releaseResourceLock } from "@/lib/redis";
import { hueclawCommsMetadataSchema } from "@/lib/zod/hueclaw/comms-metadata";
import { NextResponse } from "next/server";
import { handleHueClawImagen } from "@/lib/hueclaw/handlers/imagen";
import { handleHueClawCommunication } from "@/lib/hueclaw/handlers/communication";
import { aiResultSchema } from "@/lib/zod/hueclaw/result-payload";
import { handleHueClawQuote } from "@/lib/hueclaw/handlers/quote";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.LAMBDA_WEBHOOK_SECRET;
  const authHeader = req.headers.get("x-webhook-secret");

  if (authHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let lockKey: string | null | undefined = null;

  let threadId: string | null | undefined = null;

  try {
    const body = await req.json();
    console.log("[HueClaw Webhook] Body received:", body);

    const { systemTaskId, result, status, error } = body;

    // 1. Fetch Task & Validate
    const task = await prisma.systemTask.findUnique({
      where: { id: systemTaskId },
    });

    if (!task) throw new Error("System task not found");
    lockKey = task.lockKey; // Save to local scope for the catch block!

    const parsedMetadata = hueclawCommsMetadataSchema.safeParse(task.metadata);
    if (!parsedMetadata.success) {
      throw new Error("Invalid metadata format in SystemTask");
    }
    threadId = parsedMetadata.data.threadId;

    // 2. Mark this initial COMMS task as completed
    await prisma.systemTask.update({
      where: { id: systemTaskId },
      data: { status: "COMPLETED" },
    });

    const parsedResult = aiResultSchema.safeParse(result);

    if (!parsedResult.success) {
      console.error(
        "[HueClaw] AI hallucinated the JSON structure:",
        parsedResult.error,
      );
      throw new Error("Invalid AI payload structure");
    }

    const {
      generateImage,
      generateQuote,
      suggestedDeliveryMethod: deliveryMethod,
      suggestedSms,
      suggestedEmail,
    } = parsedResult.data;

    const msgBody =
      deliveryMethod === "SMS"
        ? (suggestedSms ?? null)
        : (suggestedEmail?.body ?? null); // ?. gives undefined; ?? null converts it

    const msgSubject =
      deliveryMethod === "EMAIL"
        ? (suggestedEmail?.subject ?? null) // same here
        : null;

    // 🎒 Create the "Backpack" to carry to the next step
    const pendingMessage = {
      deliveryMethod,
      msgBody,
      msgSubject,
    };

    // ==========================================
    // 🚦 Single trigger from booleans
    // ==========================================
    const TRIGGERS = {
      GENERATE_IMAGE: "generateImage",
      GENERATE_QUOTE: "generateQuote",
      NONE: "none",
    } as const;

    const trigger = generateImage
      ? TRIGGERS.GENERATE_IMAGE
      : generateQuote
        ? TRIGGERS.GENERATE_QUOTE
        : TRIGGERS.NONE;

    // ==========================================
    // 🚦 Routing switch
    // ==========================================
    switch (trigger) {
      case TRIGGERS.GENERATE_IMAGE: {
        console.log(
          `[HueClaw] 🎨 Handoff to Imagen triggered for thread ${threadId}`,
        );
        await clearHueClawStatus(threadId);
        await handleHueClawImagen(threadId, lockKey as string, pendingMessage);
        // Lock stays owned → DO NOT RELEASE
        return NextResponse.json({
          success: true,
          message: "Handed off to Imagen",
        });
      }

      case TRIGGERS.GENERATE_QUOTE: {
        console.log(
          `[HueClaw] 💰 Handoff to Quote triggered for thread ${threadId}`,
        );
        await clearHueClawStatus(threadId);
        await handleHueClawQuote(threadId, lockKey as string, pendingMessage);
        return NextResponse.json({
          success: true,
          message: "Handed off to Quote",
        });
      }

      case TRIGGERS.NONE: {
        console.log(`[HueClaw] 💬 Communication-only for thread ${threadId}`);
        await clearHueClawStatus(threadId);
        await handleHueClawCommunication({ threadId, lockKey, pendingMessage });
        return NextResponse.json({
          success: true,
          message: "Handed off to Communications",
        });
      }

      default: {
        // Should never happen, but safety net
        await clearHueClawStatus(threadId);
        console.warn(`[HueClaw] Unexpected trigger: ${trigger}`);
        break;
      }
    }
    return NextResponse.json({
      success: true,
      message: "Comms cycle complete",
    });
  } catch (error) {
    console.error("[HueClaw] Webhook error:", error);

    // 🚨 FAILSAFE: If anything crashes during routing, release the lock!
    if (lockKey) {
      await releaseResourceLock(lockKey);
      console.log(`[HueClaw] 🔓 Lock released due to crash`);
    }
    if (threadId) {
      await clearHueClawStatus(threadId);
    }

    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
