import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { AgentDispatchClient, RoomServiceClient } from "livekit-server-sdk";
import { setAgentContext } from "@/lib/redis/agent-context";
import { connect } from "http2";
import {
  acquireResourceLock,
  clearHueClawStatus,
  releaseResourceLock,
  setHueClawStatus,
} from "@/lib/redis";

interface Params {
  params: Promise<{
    slug: string;
    customerId: string;
    threadId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { customerId, slug, threadId } = await params;
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json({ message: "Invalid Session" }, { status: 404 });
  }

  const isUserValid = await prisma.subdomainUser.findFirst({
    where: {
      email: userEmail,
      AND: { subdomain: { slug } },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      subdomain: { select: { slug: true, id: true } },
    },
  });

  if (!isUserValid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  let lockKey: string | null = null;
  try {
    lockKey = await acquireResourceLock(threadId, "OUTBOUND_CALL");

    if (!lockKey) {
      return NextResponse.json(
        { message: "Task already running for this project!" },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { customerNumber, operatorNumber, callType = "AI_CONFERENCE" } = body;

    // 1. Fetch the thread
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        customer: true,
        communications: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        bookingData: {
          include: { quotes: true, paintColors: true },
        },
      },
    });

    if (!thread || !thread.customer) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // 2. Build agent context payload
    const agentContextPayload = {
      customer: {
        name: thread.customer.name,
        email: thread.customer.email,
        phone: customerNumber,
      },
      operator: {
        name: isUserValid.name,
        phone: operatorNumber,
        id: isUserValid.id,
      },
      recentMessages: thread.communications.reverse().map((c) => ({
        role: c.role,
        content: c.body,
        date: c.createdAt,
      })),
      quotes: thread.bookingData?.flatMap((b) => b.quotes) || [],
      paintColors: thread.bookingData?.flatMap((b) => b.paintColors) || [],
    };

    // 3. Unique room name
    const roomName = `call-${isUserValid.subdomain.slug}-${threadId}-${Date.now()}`;

    // 4. Stash full context in Redis so agent can hydrate itself
    await setAgentContext(roomName, agentContextPayload);

    // 5. LiveKit clients
    const roomClient = new RoomServiceClient(
      process.env.LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
    );
    const agentDispatchClient = new AgentDispatchClient(
      process.env.LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
    );

    const outboundCall = await prisma.outboundCall.create({
      data: {
        subdomain: { connect: { id: isUserValid.subdomain.id } },
        roomName,
        callType,
        thread: { connect: { id: threadId } },
      },
    });

    const systemTask = await prisma.systemTask.create({
      data: {
        deliveryMethod: "NONE",
        initiator: "OPERATOR",
        lockKey,
        status: "PROCESSING",
        type: "OUTBOUND_CALL",
        customer: { connect: { id: customerId } },
        subdomain: { connect: { id: isUserValid.subdomain.id } },
        operator: { connect: { id: isUserValid.id } },
        metadata: {
          roomName,
          outboundCallId: outboundCall.id,
          threadId,
          callType,
          operatorNumber,
          customerNumber,
        },
      },
    });

    // 6. Create the room — pass everything the agent needs in metadata
    await roomClient.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60,
      metadata: JSON.stringify({
        systemTaskId: systemTask.id,
        outboundCallId: outboundCall.id,
        customerId,
        threadId,
        callType,
        operatorNumber,
        operatorName: isUserValid.name,
        operatorId: isUserValid.id,
        customerNumber, // ✅ agent dials this
        customerName: thread.customer.name,
        subdomain_id: isUserValid.subdomain.id, // ✅ agent uses this
        agentMode: "sales",
        hasRedisContext: true,
      }),
    });

    // 7. Dispatch the agent — it handles all dialing from here
    await agentDispatchClient.createDispatch(roomName, "telephony_agent");
    await setHueClawStatus(threadId, "OUTBOUND_CALL");

    return NextResponse.json(
      { message: "LiveKit Dispatch Successful", roomName },
      { status: 200 },
    );
  } catch (error) {
    console.error("LiveKit Dispatch Error:", error);
    if (lockKey) {
      await releaseResourceLock(lockKey);
    }
    await clearHueClawStatus(threadId);
    return NextResponse.json(
      { message: "Internal Error", error: String(error) },
      { status: 500 },
    );
  }
}
