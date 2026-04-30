import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendBasicEmail } from "@/lib/resend/services/send-email";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    const demoClient = await prisma.demoClient.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });

    if (!demoClient) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }
    if (!demoClient.email) {
      return NextResponse.json(
        { message: "No email on file" },
        { status: 400 },
      );
    }

    const { body, subject } = await req.json();

    await sendBasicEmail({
      email: demoClient.email,
      subject: subject ?? "Update from Your Painter",
      body,
    });

    await prisma.clientCommunication.create({
      data: {
        body,
        type: "EMAIL",
        role: "OPERATOR",
        demoClient: { connect: { id: demoClient.id } },
      },
    });

    return NextResponse.json({ message: "Email sent" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error:", error },
      { status: 500 },
    );
  }
}
