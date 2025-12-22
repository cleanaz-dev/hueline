// api/subdomain/[slug]/ingest/[callSid]/existing

import { getCallIntelligence } from "@/lib/handlers";
import { prisma } from "@/lib/prisma";
import { createCallIngestLog } from "@/lib/prisma/mutations/logs/create-call-log";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    callSid: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { callSid, slug } = await params;

  if (!slug || !callSid) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  // Auth check
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { hueline_id: huelineId, domain_id: domainId, duration, phone } = body;

    console.log("Processing existing caller:", { callSid, slug, huelineId });

    // Validate required fields
    if (!huelineId || !domainId || !duration) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Find existing booking
    const existingBooking = await prisma.subBookingData.findUnique({
      where: {
        huelineId,
        subdomain: { id: domainId },
      },
      select: {
        id: true,
        calls: true,
        phone: true,
        name: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { message: "Booking Does Not Exist" },
        { status: 404 }
      );
    }

    // Create call record
    const newCall = await prisma.call.create({
      data: {
        bookingData: { connect: { id: existingBooking.id } },
        callSid: callSid,
        status: "COMPLETED",
        duration: duration,
      },
    });

    // Create call log
    await createCallIngestLog({
      bookingDataId: existingBooking.id,
      subdomainId: domainId,
      callSid: callSid,
      customerPhone: existingBooking.phone,
      customerName: existingBooking.name,
    });

    // Trigger async call intelligence processing (will update lastCallAt)
    await getCallIntelligence({
      hueline_id: huelineId,
      call_sid: callSid,
      domain_id: domainId,
      slug: slug,
      action: "existing",
    });

    return NextResponse.json({ 
      message: "Success",
      callId: newCall.id 
    }, { status: 200 });

  } catch (error) {
    console.error("Error processing existing caller:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}