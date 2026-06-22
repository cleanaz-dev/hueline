import { handleEndOfCall } from "@/lib/handlers/handle-end-of-call";
import { prisma } from "@/lib/prisma";
import { acquireResourceLock, releaseResourceLock } from "@/lib/redis";
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
  let lockKey: string | null = null;

  try {
    lockKey = await acquireResourceLock(threadId, "INTELLIGENCE");
    const body = await req.json();
    const { duration, status, roomName, triggerSource, callSid } = body;

    const call = await prisma.call.update({
      where: { id: callId },
      data: {
        status,
        duration: String(duration),
      },
      select: {
        id: true,
        customerId: true,
      },
    });

    if (triggerSource) {
      await handleEndOfCall({
        callId: call.id,
        callSid,
        customerId,
        duration,
        roomName,
        threadId,
        status,
        slug,
        lockKey: lockKey!
      });
    }

    return NextResponse.json({ message: "Updated Call" }, { status: 200 });
  } catch (error) {
    console.error(error);
    if(lockKey) {
      await releaseResourceLock(threadId)
    }
    return NextResponse.json(
      { message: "Error Updating Call" },
      { status: 500 },
    );
  }
}