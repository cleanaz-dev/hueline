import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiChatSuggestion } from "@/lib/moonshot";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ customerId: string; slug: string; threadId: string }>;
  },
) {
  // 1. Auth Check
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || !user.email) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  const { customerId, slug, threadId } = await params;

  // 2. Validate user belongs to subdomain
  const isUserValid = await prisma.subdomain.findFirst({
    where: {
      slug,
      users: {
        some: { email: user?.email },
      },
    },
  });

  if (!isUserValid) {
    return NextResponse.json({ message: "Access Denied" }, { status: 401 });
  }

  try {
    // 3. Fetch customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    // 4. Fetch thread with its activities and communications
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        communications: {
          select: {
            role: true,
            type: true,
            body: true,
            createdAt: true,
          },
        },
        activities: {
          select: {
            type: true,
            title: true,
            createdAt: true,
          },
        },
        bookingData: {
          include: {
            paintColors: true,
          }
        }
      },
    });

    if (!thread) {
      return NextResponse.json(
        { message: "Thread not found" },
        { status: 404 },
      );
    }

    // 5. Map Activities to look like messages for the AI
    const mappedActivities = thread.activities.map((act) => ({
      role: "SYSTEM",
      type: "ACTIVITY",
      body: act.title || act.type.replace(/_/g, " "),
      createdAt: act.createdAt,
    }));

    // 6. Merge and sort chronologically (oldest to newest)
    const timeline = [...thread.communications, ...mappedActivities].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    // 7. Slice the last 15 items to avoid blowing up the LLM token limit
    const recentMessages = timeline.slice(-15).map((msg) => ({
      role: msg.role,
      type: msg.type,
      body: msg.body,
    }));

    // 8. Call AI function
    const aiResult = await aiChatSuggestion({
      clientName: customer.name || "Customer",
      clientStatus: customer.status || "ACTIVE",
      recentMessages,
    });

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("AI Suggestion Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI suggestion" },
      { status: 500 },
    );
  }
}