import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        slug: string;
        huelineId: string;
    }>
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug, huelineId } = await params;
    
    // Validate params
    if (!slug || !huelineId) {
      return NextResponse.json(
        { error: "Invalid params" }, 
        { status: 400 }
      );
    }
    
    // 1. Find the booking ID using the huelineId
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId: huelineId },
      select: { id: true }
    });

    if (!booking) return NextResponse.json([], { status: 404 });

    // 2. Fetch the logs
    const logs = await prisma.logs.findMany({
      where: { bookingDataId: booking.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}