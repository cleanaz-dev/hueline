import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 👇 Keep your import path
import { aiChatSuggestion } from "@/lib/moonshot";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string; slug: string }> },
) {
  // 1. Auth Check
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || !user.email) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }
  
  const { customerId, slug } = await params;

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
    // 3. Fetch the Customer details (for the AI prompt context)
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    // 4. Fetch real Communications
    const communications = await prisma.clientCommunication.findMany({
      where: { customerId },
      select: {
        role: true,
        type: true,
        body: true,
        createdAt: true,
      }
    });

    // 5. Fetch real Activities
    const activities = await prisma.clientActivity.findMany({
      where: { customerId },
      select: {
        type: true,
        title: true,
        createdAt: true,
      }
    });

    // 6. Map Activities to look like messages for the AI
    const mappedActivities = activities.map((act) => ({
      role: "SYSTEM",
      type: "ACTIVITY",
      body: act.title || act.type.replace(/_/g, " "),
      createdAt: act.createdAt,
    }));

    // 7. Merge and Sort chronologically (oldest to newest)
    const timeline = [...communications, ...mappedActivities].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 8. Format the payload for the AI
    // We slice the last 15 items so we don't blow up the LLM token limit
    // if the customer has hundreds of messages!
    const recentMessages = timeline
      .slice(-15)
      .map((msg: any) => ({
        role: msg.role,
        type: msg.type,
        body: msg.body,
      }));

    // 9. Call your AI function
    const aiResult = await aiChatSuggestion({
      // IMPORTANT: Adjust 'name' and 'status' if your Prisma Customer model uses different fields (like firstName / lastName)
      clientName: customer.name || "Customer", 
      clientStatus: customer.status || "ACTIVE",
      recentMessages: recentMessages,
    });

    return NextResponse.json(aiResult);

  } catch (error) {
    console.error("AI Suggestion Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI suggestion" },
      { status: 500 }
    );
  }
}