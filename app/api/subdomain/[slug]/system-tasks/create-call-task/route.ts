import { triggerIntelligenceLambda } from "@/lib/lambda";
import { prisma } from "@/lib/prisma";
import { VoiceMetadata } from "@/lib/zod/job-voice-metadata";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const body = await req.json();

    const {
      callSid,
      customerId,
      huelineId,
      duration,
      to,
      domainId,
      from,
      callerName,
      callerPhone,
      triggerSource,
    } = body;

    const subdomain = await prisma.subdomain.findUnique({
      where: { id: domainId },
      select: { id: true, slug: true },
    });

    if (slug !== subdomain?.slug) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    // Booking lookup is optional — only attempt if huelineId was provided
    const booking = huelineId
      ? await prisma.subBookingData.findUnique({
          where: { huelineId },
          select: { id: true },
        })
      : null;

    const newCall = await prisma.call.create({
      data: {
        callSid,
        status: "PROCESSING",
        subdomain: { connect: { id: subdomain.id } },
        callerName,
        callerPhone,
        ...(customerId && { customer: { connect: { id: customerId } } }),
        ...(booking && { bookingData: { connect: { id: booking.id } } }),
      },
    });

    const newSystemTask = await prisma.systemTask.create({
      data: {
        initiator: "SYSTEM",
        type: "VOICE",
        status: "PROCESSING",
        ...(customerId && { customer: { connect: { id: customerId } } }),
        huelineId: huelineId ?? null,
        model: "assemblyai",
        metadataSource: "VOICE",
        metadata: {
          to,
          from,
          duration,
          callSid,
          callerName,
          callerPhone,
          callId: newCall.id,
          ...(booking && { bookingId: booking.id }),
          triggerSource, // passed directly from agent
        } satisfies VoiceMetadata,
      },
    });

    await triggerIntelligenceLambda({
      call_sid: callSid,
      hueline_id: huelineId ?? null,
      slug,
      domain_id: subdomain.id,
      system_task_id: newSystemTask.id,
    });

    return NextResponse.json({ systemTask_id: newSystemTask.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
