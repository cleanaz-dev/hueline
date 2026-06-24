import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { twilioClient } from "@/lib/twilio/config";
import axios from "axios";
import { cancelPendingFollowUp } from "@/lib/aws/event-scheduler/cancel-followups";
import { invalidateThreadCache } from "@/lib/redis/agent-context";
import { pusherServer } from "@/lib/pusher/pusher-server";

interface Params {
  params: Promise<{ slug: string; twilioNumber: string }>;
}

const MAX_MESSAGES_PER_HOUR = 10;

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function POST(req: Request, { params }: Params) {
  const redis = await getRedisClient();

  try {
    const { slug, twilioNumber: rawTwilioNumber } = await params;
    const twilioNumber = decodeURIComponent(rawTwilioNumber);
    const { incomingPhone, incomingMessage, mediaUrls = [] } = await req.json();

    if (!incomingPhone || !incomingMessage || !slug) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 1. Make sure this number actually belongs to the subdomain
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true, twilioPhoneNumber: true },
    });

    if (!subdomain || !subdomain.twilioPhoneNumber) {
      return NextResponse.json(
        { error: "Required Subdomain data not found" },
        { status: 404 },
      );
    }

    if (
      normalizePhone(subdomain.twilioPhoneNumber) !==
      normalizePhone(twilioNumber)
    ) {
      return NextResponse.json(
        { error: "Invalid Twilio number for this subdomain" },
        { status: 401 },
      );
    }

    // 2. Rate limit per customer
    const rateKey = `sms_limit:${slug}:${normalizePhone(incomingPhone)}`;
    const count = await redis.incr(rateKey);
    if (count === 1) await redis.expire(rateKey, 3600);

    if (count > MAX_MESSAGES_PER_HOUR) {
      if (count === MAX_MESSAGES_PER_HOUR + 1) {
        await twilioClient.messages.create({
          body: "You've reached the messaging limit. Please book a meeting to continue!",
          from: twilioNumber,
          to: incomingPhone,
        });
      }
      return NextResponse.json({ success: true, message: "Rate limited" });
    }

    // 3. Find customer + open thread
    const customer = await prisma.customer.findFirst({
      where: { phone: incomingPhone, subdomain: { slug } },
    });

    if (!customer) {
      console.warn(
        `[incoming-sms] Unknown sender ${incomingPhone} for ${slug}`,
      );
      return NextResponse.json({
        success: true,
        message: "Unknown sender dropped",
      });
    }

    const thread = await prisma.chatThread.findFirst({
      where: { customerId: customer.id, status: "OPEN" },
    });

    if (!thread) {
      console.warn(`[incoming-sms] No open thread for ${customer.name}`);
      return NextResponse.json({ success: true, message: "No open thread" });
    }

    // 4. Always save communication, activity, and log — regardless of autopilot

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

    // Clears Redis Thread Cache
    await invalidateThreadCache(slug, thread.id);

     try {
      await pusherServer.trigger(`thread-${thread.id}`, "new-message", {
        threadId: thread.id,
      });
    } catch (pusherErr) {
      console.error("Failed to trigger pusher for new message", pusherErr);
    }

    // 5. If autopilot is on, delay then nudge the AI
    if (thread.isAutoPilot) {
      const delay = Math.floor(Math.random() * 3000) + 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      await cancelPendingFollowUp(thread.id);

      await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/subdomain/${slug}/hue-claw/${thread.id}/nudge`,
      );

      return NextResponse.json({ success: true, message: "Auto Pilot ON" });
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
