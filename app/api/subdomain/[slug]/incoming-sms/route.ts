import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { twilioClient } from "@/lib/twilio/config";
import { sendDynamicSms } from "@/lib/twilio/sms";

const MAX_MESSAGES_PER_HOUR = 10;

interface Params {
  params: Promise<{ slug: string }>
}

export async function POST(req: Request, { params }: Params) {
  const redis = await getRedisClient();
  const { slug } = await params;

  try {
    // 1. PARSE JSON
    const { incomingPhone, incomingMessage, twilioId } = await req.json();

    if (!incomingPhone || !incomingMessage) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 2. RATE LIMITING
    const rateLimitKey = `sms_limit:${incomingPhone}`;
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

    // 3. IDENTIFY USER
    const customer = await prisma.customer.findFirst({ where: { phone: incomingPhone } });

    if (!customer || !customer.name) {
      return NextResponse.json({ success: true, message: "Unknown sender dropped" });
    }

    
    const recipientName = customer.name

    // 4. LOG INCOMING MESSAGE (Always log so the Operator sees it in the Chat Drawer)
    await prisma.clientCommunication.create({
      data: {
        body: incomingMessage,
        role: "CLIENT",
        type: "SMS",
      },
    });

    // 5. CHECK FOR AI PAUSE (The "Muzzle")
    // If the operator recently sent a manual message, this key will exist in Redis.
    const pauseKey = `ai_paused:${incomingPhone}`;
    const isPaused = await redis.get(pauseKey);

    if (isPaused) {
      console.log(`[${slug}] AI is muzzled for ${incomingPhone}. Operator is in control.`);
      return NextResponse.json({ success: true, message: "AI paused by operator" });
    }

    // 6. GET RECENT HISTORY (Last 5 messages for Kimi's context)
    const previousMessages = await prisma.clientCommunication.findMany({
      where: {customerId: customer.id},
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const history = previousMessages.reverse().map((msg) => ({
      role: msg.role === "AI" ? ("assistant" as const) : ("user" as const),
      content: msg.body,
    }));

    // 7. TRIGGER THE BRAIN
    await sendDynamicSms({
      to: incomingPhone,
      recipientName: recipientName,
      promptType: "CONVERSATION",
      context: incomingMessage,
      customerId: customer.id,
      history: history,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Internal Service Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}