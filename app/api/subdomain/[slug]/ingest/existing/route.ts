import { getCallIntelligence } from "@/lib/handlers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      heuline_id: huelineId,
      domain_id: domainId,
      slug: slug,
      call_sid: callSid,
    } = body;
    console.log("Body:", body);

    if (!huelineId || !domainId || !slug || callSid)
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });

    const existingBooking = await prisma.subBookingData.findUnique({
      where: {
        huelineId,
        subdomain: { id: domainId },
      },
      select: {
        id: true,
        calls: true,
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

    await getCallIntelligence({
      hueline_id: huelineId,
      call_sid: callSid,
      domain_id: domainId,
      slug: slug,
      action: "existing"
    });

    return NextResponse.json({ messge: "Success" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
