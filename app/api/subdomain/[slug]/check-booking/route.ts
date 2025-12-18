import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ slug: string }>
}

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!slug || !phone) {
    return NextResponse.json({ error: "Missing slug or phone" }, { status: 400 });
  }

  try {
    const bookingData = await prisma.subBookingData.findFirst({
      where: {
        subdomain: { slug },
        phone: phone ,
      },
      select: {
        huelineId: true,
        currentProjectScope: true,
        roomType: true,
        lastCallAt: true,
        paintColors: true,
        dimensions: true,
        summary: true
      },
      orderBy: {
        lastCallAt: 'desc'
      }
    });

    if (!bookingData) {
      return NextResponse.json({ has_booking: false });
    }

    return NextResponse.json({
      has_booking: true,
      booking: {
        hueline_id: bookingData.huelineId,
        previous_call_date: bookingData.lastCallAt,
        projectType: bookingData.currentProjectScope,
        room_type: bookingData.roomType,
        summary: bookingData.summary,
        paint_colors: bookingData.paintColors,
      }
    });

  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}