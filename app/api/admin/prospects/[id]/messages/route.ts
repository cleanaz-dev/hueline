import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Fetch Communications WITH their attachments
    const communications = await prisma.clientCommunication.findMany({
      where: {
        OR: [{ demoClientId: id }, { clientId: id }],
      },
      include: {
        mediaAttachments: true, // <-- THIS IS THE MAGIC KEY
      }
    });

    // 2. Fetch Activities
    const activities = await prisma.clientActivity.findMany({
      where: {
        OR:[{ demoClientId: id }, { clientId: id }],
      },
    });

    // 3. Map Activities to match the Communication shape
    const mappedActivities = activities.map((act) => ({
      id: act.id,
      role: "SYSTEM",
      type: "ACTIVITY",
      body: act.title || act.type.replace(/_/g, " "), 
      createdAt: act.createdAt,
      mediaAttachments:[], // Empty array so the frontend doesn't crash
    }));

    // 4. Merge and Sort chronologically
    const timeline = [...communications, ...mappedActivities].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return NextResponse.json(timeline);
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      {message: "Internal Server  Error:", error},
      {status: 500},
    )
  }
}