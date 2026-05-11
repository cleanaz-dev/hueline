import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_PROSPECTS } from "@/components/admin/prospects/mock-data";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (process.env.NODE_ENV === "development") {
      const mock = MOCK_PROSPECTS.find((p) => p.id === id);

      if (mock) {
        return NextResponse.json(mock.communication);
      }
    }

    // 1. Fetch Communications WITH their attachments
    const communications = await prisma.clientCommunication.findMany({
      where: {
        customerId: id,
      },
      include: {
        mediaAttachments: true, // <-- THIS IS THE MAGIC KEY
      },
    });

    // 2. Fetch Activities
    const activities = await prisma.clientActivity.findMany({
      where: { customerId: id },
    });

    // 3. Map Activities to match the Communication shape
    const mappedActivities = activities.map((act) => ({
      id: act.id,
      role: "SYSTEM",
      type: "ACTIVITY",
      activityType: act.type, // <-- CRITICAL: Tells UI which icon/card to use (e.g., SETUP_FEE_PAID)
      body: act.title || act.type.replace(/_/g, " "),
      description: act.description, // <-- CRITICAL: Passes the longer system notes
      metadata: act.metadata, // <-- CRITICAL: Passes the Stripe/Form JSON data!
      createdAt: act.createdAt,
      mediaAttachments: [], // Empty array so the frontend doesn't crash
    }));

    // 4. Merge and Sort chronologically
    const timeline = [...communications, ...mappedActivities].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return NextResponse.json(timeline);
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { message: "Internal Server Error:", error },
      { status: 500 },
    );
  }
}
