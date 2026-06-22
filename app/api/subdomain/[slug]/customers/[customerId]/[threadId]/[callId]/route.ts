import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    customerId: string;
    threadId: string;
    callId: string;
  }>;
}

export async function PATCH(req: Request, { params }: Params) {
  const { callId, customerId, slug, threadId } = await params;

  // const authHeaders = req.headers.get("x-webhook-secret");

  try {
    const body = await req.json();
    const { duration, status, roomName, triggerSource, callSid } = body;

    await prisma.call.update({
      where: { id: callId },
      data: {
        status,
        duration: String(duration),
      },
    });

    // if (triggerSource) {
    //   await handleEndOfCall(...)
    // }

    return NextResponse.json({ message: "Updated Call" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Updating Call" },
      { status: 500 },
    );
  }
}