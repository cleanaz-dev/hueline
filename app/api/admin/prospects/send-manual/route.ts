import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import { twilioClient } from "@/lib/twilio/config";

export async function POST(req: Request) {
  try {
    const { prospectId, phone, body } = await req.json();
    const redis = await getRedisClient();

    // 1. SEND VIA TWILIO
    await twilioClient.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: body
    });

    // 2. LOG AS OPERATOR
    await prisma.clientCommunication.create({
      data: {
        body: body,
        role: "OPERATOR", // New role for manual messages
        type: "SMS",
        demoClient: { connect: { id: prospectId } }
      }
    });

    // 3. MUZZLE THE AI (Set a "Human is talking" flag for 2 hours)
    const pauseKey = `ai_paused:${phone}`;
    await redis.set(pauseKey, "true", { EX: 7200 }); 

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}