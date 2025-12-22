//api/subdomain/[slug]/ingest/[callSid]/new/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCallIntelligence } from "@/lib/handlers";

interface Params {
  params: Promise<{
    slug: string;
    callSid: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { callSid, slug } = await params;

  if (!callSid || !slug) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  // Auth check
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      hueline_id: huelineId, 
      duration, 
      domain_id: domainId, 
      phone 
    } = body;

    console.log("Processing new caller:", { callSid, slug, phone, hasBooking: !!huelineId });

    // Validate required fields
    if (!duration || !domainId || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Create call record - only connect to booking if huelineId exists
    const newCall = await prisma.call.create({
      data: {
        callSid: callSid,
        status: "COMPLETED",
        duration: duration,
        // Only connect to booking if they created a mockup (has huelineId)
        ...(huelineId && { bookingData: { connect: { huelineId } } }),
      },
    });

    // Trigger async call intelligence processing
    await getCallIntelligence({
      hueline_id: huelineId,
      call_sid: callSid,
      domain_id: domainId,
      slug: slug,
      action: "new",
    });

    

    return NextResponse.json({ 
      message: "Success",
      callId: newCall.id,
      hasBooking: !!huelineId
    }, { status: 200 });

  } catch (error) {
    console.error("Error processing new caller:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}