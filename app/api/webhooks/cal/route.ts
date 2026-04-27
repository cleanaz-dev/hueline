// app/api/webhooks/cal/route.ts
import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const SECRET_KEY = process.env.CAL_WEBHOOK_SECRET;

export async function POST(req: Request) {
  // CHECK WEBHOOK SECRET
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader || authHeader !== `Bearer ${SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.triggerEvent !== "BOOKING_CREATED") {
    return NextResponse.json({ ok: true });
  }

  const attendee = body.payload?.attendees?.[0];
  const title = body.payload?.title;
  const start = new Date(body.payload?.startTime);

  if (!attendee?.phoneNumber) {
    return NextResponse.json({ ok: true });
  }

  const formatted = start.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  await client.messages.create({
    to: attendee.phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER!,
    body: `Hi ${attendee.name}, your booking "${title}" is confirmed for ${formatted}. See you then!`,
  });

  return NextResponse.json({ ok: true });
}