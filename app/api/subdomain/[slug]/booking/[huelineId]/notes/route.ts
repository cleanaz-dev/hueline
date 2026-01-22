import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; huelineId: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, huelineId } = await params;

  try {
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: { id: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const logs = await prisma.logs.findMany({
      where: { bookingDataId: booking.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        actor: true,
        title: true,
        description: true,
        metadata: true,
        createdAt: true,
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; huelineId: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, huelineId } = await params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content required" }, { status: 400 });
  }

  const actor = session.role === "customer" ? "CLIENT" : "PAINTER";

  try {
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: { id: true, subdomainId: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await prisma.logs.create({
      data: {
        bookingDataId: booking.id,
        subdomainId: booking.subdomainId,
        type: "NOTE",
        actor: actor,
        title: "Note Added",
        description: content,
        metadata: {
          authorName: session.user?.name || session.user?.email || "Unknown"
        }
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to add note:", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}