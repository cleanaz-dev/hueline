import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { twilioClient } from "@/lib/twilio/config";
import { sendDynamicSms } from "@/lib/twilio/sms";

const MAX_MESSAGES_PER_HOUR = 10;

export async function POST(req: Request) {
  const redis = await getRedisClient();

  try {
    // 1. TWILIO PARSING (Twilio sends form-data, not JSON)
    const formData = await req.formData();
    const incomingPhone = formData.get("From") as string;
    const incomingMessage = formData.get("Body") as string;

    if (!incomingPhone || !incomingMessage) {
      return new Response("Missing Data", { status: 400 });
    }

    // 2. RATE LIMITING
    const redisKey = `sms_limit:${incomingPhone}`;
    const currentCount = await redis.incr(redisKey);
    if (currentCount === 1) await redis.expire(redisKey, 3600);

    if (currentCount > MAX_MESSAGES_PER_HOUR) {
      if (currentCount === MAX_MESSAGES_PER_HOUR + 1) {
        await twilioClient.messages.create({
          body: "You've reached the messaging limit. Please hold tight, or book a meeting to continue!",
          from: process.env.TWILIO_PHONE_NUMBER,
          to: incomingPhone,
        });
      }
      return NextResponse.json({ success: true });
    }

    // 3. USER IDENTIFICATION (Checking both DemoClient and Client)
    const demoClient = await prisma.demoClient.findFirst({ where: { phone: incomingPhone } });
    const regularClient = !demoClient ? await prisma.client.findFirst({ where: { phone: incomingPhone } }) : null;

    const user = demoClient || regularClient;

    if (!user) {
      console.log(`Unknown sender: ${incomingPhone}. Dropping.`);
      return NextResponse.json({ success: true });
    }

    // Helper flags for Type Safety
    const isDemo = 'name' in user;
    const recipientName = (isDemo ? user.name : user.firstName) || "there";

    // 4. LOG INCOMING MESSAGE
    // This allows the AI to "see" what the user just said in the next step
    await prisma.clientCommunication.create({
      data: {
        body: incomingMessage,
        role: "CLIENT",
        type: "SMS",
        ...(isDemo 
          ? { demoClient: { connect: { id: user.id } } } 
          : { client: { connect: { id: user.id } } }
        ),
      },
    });

    // 5. FETCH RECENT HISTORY
    // We grab the last 5 messages to provide conversation context (Memory)
    const previousMessages = await prisma.clientCommunication.findMany({
      where: isDemo ? { demoClientId: user.id } : { clientId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const history = previousMessages.reverse().map((msg) => ({
      role: msg.role === "AI" ? ("assistant" as const) : ("user" as const),
      content: msg.body,
    }));

    // 6. EXECUTE THE BRAIN (Generate SMS + Send + Log Reply)
    await sendDynamicSms({
      to: incomingPhone,
      recipientName: recipientName,
      promptType: "CONVERSATION",
      context: incomingMessage,
      demoClientId: user.id, // The function expects an ID to link the communication
      history: history,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inbound SMS Error:", error);
    // Always return 200 Success to Twilio to stop them from retrying failed webhooks
    return NextResponse.json({ success: false });
  }
}