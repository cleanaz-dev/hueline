import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { GenerateSMS } from "@/lib/moonshot";
import twilio from "twilio";

const MAX_MESSAGES_PER_HOUR = 10;

export async function POST(req: Request) {
  const redis = await getRedisClient();
  try {
    const body = await req.json();
    const incomingPhone = body.From;
    const incomingMessage = body.Body;

    // 1. RATE LIMIT CHECK VIA REDIS
    const redisKey = `sms_limit:${incomingPhone}`;

    // Increment the user's message count
    const currentCount = await redis.incr(redisKey);

    // If this is their first message this hour, set the key to expire in 3600 seconds (1 hour)
    if (currentCount === 1) {
      await redis.expire(redisKey, 3600);
    }

    // 2. ENFORCE THE LIMIT
    if (currentCount > MAX_MESSAGES_PER_HOUR) {
      console.log(`Rate limit exceeded for ${incomingPhone}. Message ignored.`);

      // OPTIONAL: Send a warning ONLY on the exact message that breaches the limit
      if (currentCount === MAX_MESSAGES_PER_HOUR + 1) {
        const twilioClient = twilio(
          process.env.TWILIO_SID,
          process.env.TWILIO_AUTH_TOKEN,
        );
        await twilioClient.messages.create({
          body: "You've reached the temporary messaging limit. Please hold tight, or book a meeting to continue!",
          from: process.env.TWILIO_PHONE_NUMBER,
          to: incomingPhone,
        });
      }

      // Return 200 so Twilio is happy, but do NOT call Moonshot AI
      return NextResponse.json({ success: true });
    }

    // 3. THE GATEKEEPER (Spam/Unknown number protection)
    const user =
      (await prisma.demoClient.findFirst({
        where: { phone: incomingPhone },
      })) ||
      (await prisma.client.findFirst({
        where: { phone: incomingPhone },
      }))

    if (!user) {
      return NextResponse.json({ success: true }); // Drop unknown numbers
    }

    const recipientName = (user as any).name || (user as any).firstName || "there";

    // 4. WE ARE SAFE: Call Moonshot and respond
    const replyText = await GenerateSMS({
      type: "Customer Support / General Reply",
      recipientName: recipientName || "there",
      context: `The user texted: "${incomingMessage}"`,
    });

    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    await twilioClient.messages.create({
    // If replyText is null, it sends the fallback string instead of crashing
    body: replyText || "Sorry, we're unable to process your request right now. Please try again!",
    from: process.env.TWILIO_PHONE_NUMBER,
    to: incomingPhone,
});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling inbound SMS:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
