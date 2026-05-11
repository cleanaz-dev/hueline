import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { EVENT_TYPES, sendSmsConfirmation } from "./config";
import { format } from "date-fns";

function verifySignature(payload: string, signature: string, secret: string) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

const adminSubdomainId = process.env.ADMIN_SUBDOMAIN_ID;

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
  const eventTypeId = body.payload?.eventTypeId?.toString();
  console.log("Cal WEBHOOK", body);

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

  const formatted = format(start, "EEE, MMM d, h:mm aa");

  await sendSmsConfirmation(
    attendee.phoneNumber,
    attendee.name,
    title,
    formatted,
  );

  if (eventTypeId === EVENT_TYPES.LANDING_PAGE) {
    // create new demo client
    const newCustomer = await prisma.customer.create({
      data: {
        name: attendee.name,
        phone: attendee.phone,
        email: attendee.email,
        customerType: "DEMO",
        subdomain: { connect: { id: adminSubdomainId } },
      },
    });

    await prisma.clientActivity.create({
      data: {
        type: "CLIENT_CREATED",
        customer: { connect: { id: newCustomer.id } },
        description: "New client created via Landing Page Booking",
        title: "New Client Created!",
      },
    });
    await prisma.clientCommunication.create({
      data: {
        body: "Potential Client booked meeting from Landing Page",
        role: "CLIENT",
        type: "MEETING",
        customer: { connect: { id: newCustomer.id } },
        metadata: {
          attendeeName: attendee.name,
          attendeePhone: attendee.phone,
          startTime: start
        }
      },
    });
    await prisma.clientCommunication.create({
      data: {
        body: `Hi ${attendee.name}, your booking "${title}" is confirmed for ${formatted}. See you then!`,
        role: "AI",
        type: "SMS",
        customer: { connect: { id: newCustomer.id } },
      },
    }),
      await prisma.logs.create({
        data: {
          title: "New Meeting",
          type: "MEETING",
          actor: "CLIENT",
          description: "New Meeting from Landing Page",
          subdomain: { connect: { id: adminSubdomainId } },
          metadata: {
            name: newCustomer.name,
            email: newCustomer.email,
            phone: newCustomer.phone,
            createdAt: new Date(),
          },
        },
      });
    console.log("Booking from Landing Page");
  }

  if (eventTypeId === EVENT_TYPES.DEMO_PAGE && huelineId) {
    const customer = await prisma.customer.findFirst({
      where: {
        subBookingData: {
          some: huelineId,
        },
      },
    });

    if (!customer) {
      console.error("No Cusomter found for huelineId", huelineId);
      return NextResponse.json({ ok: true });
    }

    await Promise.all([
      prisma.customer.update({
        where: { id: customer.id },
        data: { status: "BOOKED" },
      }),
      prisma.clientCommunication.create({
        data: {
          body: `Hi ${attendee.name}, your booking "${title}" is confirmed for ${formatted}. See you then!`,
          role: "AI",
          type: "SMS",
          customer: { connect: { id: customer.id } },
        },
      }),
      prisma.clientActivity.create({
        data: {
          type: "MEETING_BOOKED",
          customer: { connect: { id: customer.id } },
          description: "Client booked meeting from Booking page.",
          title: "Meeting Booked!",
          subDomain: { connect: { id: adminSubdomainId } },
        },
      }),
      prisma.logs.create({
        data: {
          title: "New Meeting!",
          type: "MEETING",
          subdomain: { connect: { id: adminSubdomainId } },
          actor: "CLIENT",
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  }
}
