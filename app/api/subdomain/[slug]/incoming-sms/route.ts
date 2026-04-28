import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { twilioClient } from "@/lib/twilio/config";
import { sendDynamicSms } from "@/lib/twilio/sms";

const MAX_MESSAGES_PER_HOUR = 10;

export async function POST(req: Request) {
  const redis = await getRedisClient();

  try {
    // 1. PARSE JSON (Standardizing the input)
    const { incomingPhone, incomingMessage, twilioId } = await req.json();

    if (!incomingPhone || !incomingMessage) {
      return NextResponse.json({ error: "Missing incomingPhone or incomingMessage" }, { status: 400 });
    }

    // 2. RATE LIMITING (Redis)
    const redisKey = `sms_limit:${incomingPhone}`;
    const currentCount = await redis.incr(redisKey);
    if (currentCount === 1) await redis.expire(redisKey, 3600);

    if (currentCount > MAX_MESSAGES_PER_HOUR) {
      if (currentCount === MAX_MESSAGES_PER_HOUR + 1) {
        await twilioClient.messages.create({
          body: "Rate limit reached. Please hold tight!",
          from: process.env.TWILIO_PHONE_NUMBER,
          to: incomingPhone,
        });
      }
      return NextResponse.json({ success: true, message: "Rate limited" });
    }

    // 3. IDENTIFY USER (DemoClient or Client)
    const demoClient = await prisma.demoClient.findFirst({ where: { phone: incomingPhone } });
    const regularClient = !demoClient ? await prisma.client.findFirst({ where: { phone: incomingPhone } }) : null;
    const user = demoClient || regularClient;

    if (!user) {
      return NextResponse.json({ success: true, message: "Unknown sender dropped" });
    }

    const isDemo = 'name' in user;
    const recipientName = (isDemo ? user.name : user.firstName) || "there";

    // 4. LOG INCOMING MESSAGE
    // Note: We include the twilioId (SID) in the body or a metadata field if your schema allows
    await prisma.clientCommunication.create({
      data: {
        body: incomingMessage, // Optionally: `${incomingMessage} (Ref: ${twilioId})`
        role: "CLIENT",
        type: "SMS",
        ...(isDemo 
          ? { demoClient: { connect: { id: user.id } } } 
          : { client: { connect: { id: user.id } } }
        ),
      },
    });

    // 5. GET RECENT HISTORY (Last 5 messages)
    const previousMessages = await prisma.clientCommunication.findMany({
      where: isDemo ? { demoClientId: user.id } : { clientId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const history = previousMessages.reverse().map((msg) => ({
      role: msg.role === "AI" ? ("assistant" as const) : ("user" as const),
      content: msg.body,
    }));

    // 6. TRIGGER THE BRAIN
    await sendDynamicSms({
      to: incomingPhone,
      recipientName: recipientName,
      promptType: "CONVERSATION",
      context: incomingMessage,
      demoClientId: user.id,
      history: history,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Internal Service Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}