import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { releaseResourceLock } from "@/lib/redis";
import { errorHandlerPayloadSchema } from "@/lib/zod/errors/error-hanlder-payload-schema";

export async function POST(req: Request) {
  const authHeader = req.headers.get("x-webhook-secret");
  if (authHeader !== process.env.LAMBDA_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const parsed = errorHandlerPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const {
      source,
      stage,
      error,
      messageId,
      systemTaskId,
      huelineId,
      customerId,
    } = parsed.data;

    // 1. Save to DB
    await prisma.errorLog.create({
      data: {
        source,
        stage,
        error,
        messageId,
        systemTaskId,
        huelineId,
        ...(customerId ? { customer: { connect: { id: customerId } } } : {}),
      },
    });

    // 2. Mark systemTask as FAILED so UI reflects it
    if (systemTaskId) {
      await prisma.systemTask.update({
        where: { id: systemTaskId },
        data: { status: "FAILED" },
      });
    }

    if (systemTaskId) {
      const lockKeyTask = await prisma.systemTask.findUnique({
        where: { id: systemTaskId },
        select: {
          lockKey: true,
        },
      });

      if (lockKeyTask) await releaseResourceLock(lockKeyTask?.lockKey);
    }

    // 3. TODO: fire Novita agent here for Telegram/email alert

    return NextResponse.json({ message: "Error logged" }, { status: 200 });
  } catch (error) {
    console.error("Error logging failed:", error);
    return NextResponse.json(
      { message: "Failed to log error" },
      { status: 500 },
    );
  }
}
