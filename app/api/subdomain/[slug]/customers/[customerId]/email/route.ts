import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendChatEmail } from "@/lib/resend";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ slug: string; customerId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const { customerId, threadId, body, subject } = await req.json();
    const user = session.user;

    if (!customerId || !body || !subject || !user.email || !threadId) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const operator = await prisma.subdomainUser.findFirst({
      where: {
        email: user.email,
        subdomain: { slug },
      },
    });

    if (!operator) {
      return NextResponse.json({ message: "Operator not found" }, { status: 404 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true },
    });

    if (!customer?.email) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    // 🔥 ADDITION 1: Create the Omni-Channel Reply-To Address
    const replyToAddress = `chat+${threadId}@inbound.hue-line.com`;

    // Make sure your `sendChatEmail` utility inside /lib/resend is updated to accept `replyTo`
    const res = await sendChatEmail({ 
      to: customer.email, 
      subject, 
      body,
      replyTo: replyToAddress 
    });

    if (res.success) {
      // Create Activity
      await prisma.clientActivity.create({
        data: {
          type: "EMAIL_SENT",
          customer: { connect: { id: customerId } },
          description: "Sent Email to Cx",
          title: "Email",
          subDomain: { connect: { slug } },
          chatThread: { connect: { id: threadId } }, // So easy
        },
      });

      // Create Comm
      await prisma.clientCommunication.create({
        data: {
          body,
          subject,
          type: "EMAIL",
          role: "OPERATOR",
          customer: { connect: { id: customerId } },
          operator: { connect: { id: operator.id } },
          chatThread: { connect: { id: threadId } }, // So easy
        },
      });

      // 🔥 ADDITION 2: Bump the thread's updatedAt time so it sorts to the top of your UI!
      await prisma.chatThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() } // Forces the thread to the top of "Recent Chats"
      });

    } else {
      await prisma.errorLog.create({
        data: {
          source: "resend",
          stage: "EMAIL_SEND",
          error: res.error ? JSON.stringify(res.error) : "Unknown error",
          customer: { connect: { id: customerId } },
          subdomain: { connect: { slug } },
        },
      });

      return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ message: "Email sent" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error sending email" }, { status: 500 });
  }
}