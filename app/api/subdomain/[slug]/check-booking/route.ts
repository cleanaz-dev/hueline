import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ slug: string }>
}

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  
  // ✅ Use NextRequest's searchParams property directly
  const phone = req.nextUrl.searchParams.get("phone");
  
  console.log("🔍 Request:", { slug, phone });

  if (!slug || !phone) {
    return NextResponse.json({ error: "Missing slug or phone" }, { status: 400 });
  }

  try {
    const bookingData = await prisma.subBookingData.findFirst({
      where: {
        subdomain: { slug },
        phone: phone,
      },
      select: {
        huelineId: true,
        currentProjectScope: true,
        roomType: true,
        lastCallAt: true,
        paintColors: true,
        dimensions: true,
        summary: true,
        name: true,
      },
      orderBy: {
        lastCallAt: 'desc'
      }
    });

    console.log("📊 Query result:", bookingData ? "Found booking" : "No booking");

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
        caller_name: bookingData.name
      }
    });
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}