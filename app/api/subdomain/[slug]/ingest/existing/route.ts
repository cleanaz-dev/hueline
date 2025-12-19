import { getCallIntelligence } from "@/lib/handlers";
import { prisma } from "@/lib/prisma";
import { createCallIngestLog } from "@/lib/prisma/mutations/logs/create-call-log";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      hueline_id: huelineId,
      domain_id: domainId,
      slug: slug,
      call_sid: callSid,
    } = body;
    console.log("Body:", body);

    if (!huelineId || !domainId || !slug || !callSid)
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });

    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


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

    if (!existingBooking)
      return NextResponse.json(
        { message: "Booking Does Not Exist" },
        { status: 400 }
      );

    const newCall = await prisma.call.create({
      data: {
        bookingData: { connect: { id: existingBooking.id } },
        callSid: callSid,
        status: "IN_PROGRESS",
      },
    });

    await createCallIngestLog({
      bookingDataId: existingBooking.id,
      subdomainId: domainId,
      callSid: callSid,
      customerPhone: existingBooking.phone,
      customerName:existingBooking.name
    })

    await getCallIntelligence({
      hueline_id: huelineId,
      call_sid: callSid,
      domain_id: domainId,
      slug: slug,
      action: "existing"
    });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
