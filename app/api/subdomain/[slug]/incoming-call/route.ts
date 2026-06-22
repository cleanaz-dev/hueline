import { prisma } from "@/lib/prisma";
import { setHueClawStatus } from "@/lib/redis";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const key = process.env.LAMBDA_WEBHOOK_SECRET!;
  const { slug } = await params;
  const authHeaders = await req.headers.get("x-webhook-secret");

  try {
    const body = await req.json();
    const { customer_name, phone_number, call_sid, room_name } = body;

    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!subdomain) {
      return NextResponse.json(
        { message: "Subdomain not found" },
        { status: 404 },
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: customer_name,
        phone: phone_number,
        subdomain: { connect: { id: subdomain.id } },
      },
    });

    const thread = await prisma.chatThread.create({
      data: {
        shortId: nanoid(8),
        customerId: customer.id,
        subdomainId: subdomain.id,
        status: "OPEN",
        title: "NEW CALL",
      },
      select: { id: true },
    });

    await prisma.call.create({
      data: {
        callSid: call_sid,
        callerName: customer.name,
        callerPhone: phone_number,
        callDirection: "INBOUND",
        customer: { connect: { id: customer.id } },
        subdomain: { connect: { id: subdomain.id } },
        status: "PROCESSING",
        thread: { connect: { id: thread.id } },
        roomName: room_name,
      },
    });

    await setHueClawStatus(thread.id, "CALL_CONNECTED")

    return NextResponse.json(
      { message: "Call Flow Created Successfully", threadId: thread.id },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Creating Call Flow" },
      { status: 500 },
    );
  }
}
