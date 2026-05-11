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
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        subdomain: {
          select: {
           slug: true,
          },
        }
      },
    });

    if (!customer || !customer.email) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const { body, subject } = await req.json();

    await sendBasicEmail({
      email: customer.email,
      subject: subject ?? "Update from Your Painter",
      body,
    });

    await prisma.clientCommunication.create({
      data: {
        body,
        type: "EMAIL",
        role: "OPERATOR",
        customer: { connect: { id: customer.id } },
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
