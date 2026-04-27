import { NextResponse } from "next/server";
import twilio from "twilio";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

function verifySignature(payload: string, signature: string, secret: string) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-cal-signature-256");

  if (
    !signature ||
    !verifySignature(rawBody, signature, process.env.CAL_WEBHOOK_SECRET!)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  console.log("Cal WEBHOOK", body)

  if (body.triggerEvent !== "BOOKING_CREATED") {
    return NextResponse.json({ ok: true });
  }

  const attendee = body.payload?.attendees?.[0];
  const huelineId = body.payload?.responses?.huelineId?.value;
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

  if (huelineId) {
    const demoClient = await prisma.demoClient.findFirst({
      where: { subBookingData: { huelineId } },
    });

    await Promise.all([
      prisma.demoClient.update({
        where: { id: demoClient?.id },
        data: { status: "BOOKED" },
      }),
      prisma.clientCommunication.create({
        data: {
          body: `Hi ${attendee.name}, your booking "${title}" is confirmed for ${formatted}. See you then!`,
          role: "AI",
          type: "SMS",
          demoClient: { connect: { id: demoClient?.id } },
        },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}