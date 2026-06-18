import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { AgentDispatchClient, RoomServiceClient, SipClient } from "livekit-server-sdk";
import { setAgentContext } from "@/lib/redis/agent-context";

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
      subdomain: { select: { slug: true } },
    },
  });

  if (!isUserValid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
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
    const sipClient = new SipClient(
      process.env.LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
    );
    const agentDispatchClient = new AgentDispatchClient(
      process.env.LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
    );

    // 6. Create the room — callType + operatorNumber BOTH live in metadata now
    await roomClient.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60,
      metadata: JSON.stringify({
        customerId,
        threadId,
        callType,
        operatorNumber,
        operatorName: isUserValid.name,
        operatorId: isUserValid.id,
        agentMode: "sales",
        hasRedisContext: true,
      }),
    });

    // 6.5. Explicitly dispatch the "outbound_agent" worker to this room
    await agentDispatchClient.createDispatch(roomName, "outbound_agent");

    // 7. Dial the customer into the room
    await sipClient.createSipParticipant(
      process.env.LIVEKIT_SIP_TRUNK_ID!,
      customerNumber,
      roomName,
      {
        participantIdentity: `customer-${customerId}`,
        participantName: thread.customer.name!,
      },
    );

    return NextResponse.json(
      { message: "LiveKit Dispatch Successful", roomName },
      { status: 200 },
    );
  } catch (error) {
    console.error("LiveKit Dispatch Error:", error);
    return NextResponse.json(
      { message: "Internal Error", error: String(error) },
      { status: 500 },
    );
  }
}