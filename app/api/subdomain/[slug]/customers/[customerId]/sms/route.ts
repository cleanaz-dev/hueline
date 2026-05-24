import { prisma } from "@/lib/prisma";
import { sendDefaultSMS } from "@/lib/twilio/sms-default";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    customerId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug, customerId } = await params;

  try {
    const { customerId, body } = await req.json();
    console.log("Test SMS SEND FROM PROSPECTS:", body);

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!body || !customer || !customer.name || !customer.phone) {
      return NextResponse.json(
        { message: "Invalid Request - message and customer required" },
        { status: 400 },
      );
    }

    await sendDefaultSMS({
      to: customer.phone,
      body: body,
      customerId,
    });

    // ✅ Added missing success response
    return NextResponse.json(
      { message: "SMS sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    // ✅ Single try/catch — the nested try block was never closed, breaking the structure
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
