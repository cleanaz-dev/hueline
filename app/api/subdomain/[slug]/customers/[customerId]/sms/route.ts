import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateThreadCache } from "@/lib/redis/agent-context";
import { sendDefaultSMS } from "@/lib/twilio/sms-default";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    customerId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug, customerId } = await params;
  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (!user || !user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isOperatorValid = await prisma.subdomainUser.findFirst({
    where: {
      email: user.email,
    },
    select: {
      id: true,
      email: true
    }
  });

  if (!isOperatorValid)
    return NextResponse.json({ message: "No Access" }, { status: 401 });

  try {
    const { customerId, threadId, body } = await req.json();
    console.log("Test SMS SEND FROM Chat Thread:", body);

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!body || !customer || !customer.name || !customer.phone || !threadId) {
      return NextResponse.json(
        { message: "Invalid Request - message and customer required" },
        { status: 400 },
      );
    }

    await sendDefaultSMS({
      to: customer.phone,
      body: body,
    });

    await prisma.clientCommunication.create({
      data: {
        body,
        role: "OPERATOR",
        type: "SMS",
        customerId,
        chatThreadId: threadId,
        operator: { connect: { id: isOperatorValid.email } },
      },
    });

    await prisma.clientActivity.create({
      data: {
        type: "SMS_SENT",
        chatThreadId: threadId,
        customerId,
        subDomain: { connect: { slug } },
        title: "SMS Sent",
      },
    });

    // Clears Redis Thread Cache
    await invalidateThreadCache(slug, threadId)

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
