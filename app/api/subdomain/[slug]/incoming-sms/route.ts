import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { twilioClient } from "@/lib/twilio/config";

const MAX_MESSAGES_PER_HOUR = 10;

export async function POST(req: Request) {
  const redis = await getRedisClient();

  try {
    const { incomingPhone, incomingMessage, twilioId, slug } = await req.json();

    if (!incomingPhone || !incomingMessage || !slug) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 1. RATE LIMITING
    const rateLimitKey = `sms_limit:${slug}:${incomingPhone}`;
    const currentCount = await redis.incr(rateLimitKey);
    if (currentCount === 1) await redis.expire(rateLimitKey, 3600);

    if (currentCount > MAX_MESSAGES_PER_HOUR) {
      if (currentCount === MAX_MESSAGES_PER_HOUR + 1) {
        await twilioClient.messages.create({
          body: "You've reached the messaging limit. Please book a meeting to continue!",
          from: process.env.TWILIO_PHONE_NUMBER,
          to: incomingPhone,
        });
      }
      return NextResponse.json({ success: true, message: "Rate limited" });
    }

    // 2. IDENTIFY CUSTOMER — scoped to subdomain
    const customer = await prisma.customer.findFirst({
      where: {
        phone: incomingPhone,
        subdomain: { slug },
      },
    });

    if (!customer) {
      console.warn(
        `[incoming-sms] Unknown sender ${incomingPhone} for slug=${slug} — dropped`,
      );
      return NextResponse.json({
        success: true,
        message: "Unknown sender dropped",
      });
    }

    // 3. FIND OPEN THREAD
    const thread = await prisma.chatThread.findFirst({
      where: {
        customerId: customer.id,
        status: "OPEN",
      },
    });

    if (!thread) {
      console.warn(
        `[incoming-sms] No open thread for ${customer.name} — message orphaned`,
      );
      return NextResponse.json({ success: true, message: "No open thread" });
    }

    // 4. LOG COMMUNICATION + ACTIVITY — both connected to thread

     await prisma.clientActivity.create({
      data: {
        type: "SMS_INBOUND",
        customer: { connect: { id: customer.id } },
        subDomain: { connect: { id: customer.subdomainId! } },
        chatThread: { connect: { id: thread.id } },
        description: `Inbound SMS from ${customer.name}`,
        title: "Inbound SMS",
      },
    });

    await prisma.clientCommunication.create({
      data: {
        body: incomingMessage,
        role: "CLIENT",
        type: "SMS",
        customer: { connect: { id: customer.id } },
        chatThread: { connect: { id: thread.id } },
      },
    });

   

    await prisma.logs.create({
      data: {
        title: "Inbound SMS",
        type: "SMS",
        actor: "CLIENT",
        subdomain: { connect: { id: customer.subdomainId! } },
        description: "Inbound SMS",
      },
    });

    // 5. AI PAUSE CHECK
    const pauseKey = `ai_paused:${slug}:${incomingPhone}`;
    const isPaused = await redis.get(pauseKey);

    if (isPaused) {
      console.log(`[incoming-sms] AI muzzled for ${incomingPhone} on ${slug}`);
      return NextResponse.json({
        success: true,
        message: "AI paused by operator",
      });
    }

    return NextResponse.json({ success: true, threadId: thread.id });
  } catch (error) {
    console.error("[incoming-sms] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
