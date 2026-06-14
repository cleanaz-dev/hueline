import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { twilioClient } from "@/lib/twilio/config";
import axios from "axios";

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

    if (thread.isAutoPilot) {
      //4. trigger nudge here

      // 5. LOG COMMUNICATION + ACTIVITY — both connected to thread IF NO AUTOPILOT

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
      const delay = Math.floor(Math.random() * 3000) + 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/subdomain/${slug}/hue-claw/${thread.id}/nudge`,
      );
      return NextResponse.json({ success: true, message: "Auto Pilot ON" });
    }

    // 5. LOG COMMUNICATION + ACTIVITY — both connected to thread IF NO AUTOPILOT
    await prisma.clientCommunication.create({
      data: {
        body: incomingMessage,
        role: "CLIENT",
        type: "SMS",
        customer: { connect: { id: customer.id } },
        chatThread: { connect: { id: thread.id } },
      },
    });

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

    await prisma.logs.create({
      data: {
        title: "Inbound SMS",
        type: "SMS",
        actor: "CLIENT",
        subdomain: { connect: { id: customer.subdomainId! } },
        description: "Inbound SMS",
      },
    });

    return NextResponse.json({ success: true, threadId: thread.id });
  } catch (error) {
    console.error("[incoming-sms] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
