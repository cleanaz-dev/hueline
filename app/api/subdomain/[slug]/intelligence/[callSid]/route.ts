import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma";
import { createCallIngestLog } from "@/lib/prisma/mutations/logs/create-call-log";
import { getCallIntelligence } from "@/lib/handlers";

interface Params {
  params: Promise<{
    callSid: string;
    slug: string;
  }>
}

export async function POST(req: Request, { params }: Params) {
  const { callSid, slug } = await params;
  
  if (!callSid || !slug) {
    return NextResponse.json({ message: "Missing required params" }, { status: 400 });
  }

  try {
    // Check API key
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      call_sid: callSid,
      slug: slug,
      hueline_id:huelineId,
      duration: duration,
    } = await req.json();

    // Find the booking with this call
    const booking = await prisma.subBookingData.findUnique({
      where: {
        huelineId: huelineId
      },
      select: {
        id: true,
        name: true,
        phone: true,
        roomType: true,
        subdomainId: true,
      }
    });

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    // Create log entry
    await createCallIngestLog({
      bookingDataId: booking.id,
      subdomainId: booking.subdomainId,
      callSid: callSid,
      duration: duration,
      customerName: booking.name,
      customerPhone: booking.phone,
      roomType: booking.roomType,
    });

    // Trigger call intelligence
    await getCallIntelligence({
      hueline_id: huelineId,
      call_sid: callSid,
      domain_id: booking.subdomainId,
      slug: slug,
      action: "mockup"
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });

  } catch (error) {
    console.error("Error in call ingest:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}