import { prisma } from "@/lib/prisma";
import { sendDefaultSMS } from "@/lib/twilio/sms-default";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { message } = await req.json();
    console.log("Test SMS SEND FROM PROSPECTS:", message);
    return NextResponse.json({ message: "Success" }, { status: 200 });

  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
