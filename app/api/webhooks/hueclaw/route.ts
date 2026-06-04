import { prisma } from "@/lib/prisma";
import { releaseResourceLock } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Verify the webhook secret
  const WEBHOOK_SECRET = process.env.LAMBDA_WEBHOOK_SECRET;
  const authHeader = req.headers.get("x-webhook-secret");

  if (authHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse the body safely
  try {
    const body = await req.json();
    console.log("Webhook Body:", body);

    const { systemTaskId, result, status, error } = body;

    const thinking = result.thinking;
    const decision = result.decision;
    const contactRequired = result.contactRequired;
    const deliveryMethod = result.suggestedDeliveryMethod;

    // FIX: Correct type annotation syntax
    let msgBody: string | null = null;
    let msgSubject: string | null = null

    if (deliveryMethod === "SMS") {
      msgBody = result.suggestedSms;
    }
    if (deliveryMethod === "EMAIL") {
        msgBody = result.suggestedEmail
        msgSubject = result.suggestedEmailSubject
    }

    console.log(msgBody, msgSubject);


    // TODO: Add your business logic here (e.g., save to database, trigger events)
    const task = await prisma.systemTask.findUnique({
      where: { id: systemTaskId },
      include: {
        subdomain: {
          select: {
            id: true,
          },
        },
      },
    });

    const metadata = task?.metadata;
    const lockKey = task?.lockKey;

    if (lockKey) {
      await releaseResourceLock(lockKey);
    }

    // 3. Return a success response
    return NextResponse.json(
      { success: true, message: "Webhook processed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error parsing webhook JSON:", error);

    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }
}
