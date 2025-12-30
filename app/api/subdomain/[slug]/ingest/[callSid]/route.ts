import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerIntelligenceLambda } from "@/lib/lambda";
import { createCallIngestLog } from "@/lib/prisma/mutations/logs/create-call-log";

interface Params {
  params: Promise<{
    slug: string;
    callSid: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { callSid, slug } = await params;

  if (!slug || !callSid)
    return NextResponse.json(
      { message: "Invalid Parameters" },
      { status: 400 }
    );

  try {
    const body = await req.json();
    const { from, to, duration, recordingUrl, huelineId } = body;

    // 1. Get Subdomain
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: {
        id: true,
      },
    });

    if (!subdomain)
      return NextResponse.json(
        { message: "Subdomain not found" },
        { status: 404 }
      );

    // 2. Find Booking (Optional)
    let booking = null;

    // A. Priority: Match by Hueline ID
    if (huelineId) {
      booking = await prisma.subBookingData.findUnique({
        where: { huelineId },
        select: {
          id: true,
          huelineId: true,
        },
      });
    }

    // B. Fallback: Match by Phone
    if (!booking && from) {
      booking = await prisma.subBookingData.findFirst({
        where: {
          subdomainId: subdomain.id,
          phone: from,
        },
        select: {
          id: true,
          huelineId: true,
        },
      });
    }

    // 3. Upsert Call (Nullable Booking Link)
    const call = await prisma.call.upsert({
      where: { callSid },
      update: {
        duration: duration ? String(duration) : undefined,
        audioUrl: recordingUrl,
        status: "completed",
        ...(booking?.id && { bookingDataId: booking.id }),
      },
      create: {
        callSid,
        duration: duration ? String(duration) : "0",
        audioUrl: recordingUrl || "",
        status: "completed",
        subdomain: {
          connect: { id: subdomain.id }
        },
        ...(booking?.id && {
          bookingData: {
            connect: { id: booking.id }
          }
        }),
      },
    });

    // 4. Trigger Intelligence
    await triggerIntelligenceLambda({
      call_sid: callSid,
      hueline_id: booking?.huelineId,
      slug,
      domain_id: subdomain.id,
    });

    await createCallIngestLog({
      bookingDataId: booking?.id,
      subdomainId: subdomain.id,
      callSid: callSid,
      from: from,
      duration: duration ? String(duration) : "0",
    });

    return NextResponse.json({ success: true, callId: call.id });
  } catch (error) {
    console.error("Ingest Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}