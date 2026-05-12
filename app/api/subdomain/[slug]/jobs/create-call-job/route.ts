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

    const { callSid, customerId, huelineId, duration, to, domainId, from } =
      body;

    const subdomain = await prisma.subdomain.findUnique({
      where: { id: domainId },
      select: { id: true, slug: true },
    });

    if (slug !== subdomain?.slug) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const booking = await prisma.subBookingData.findUnique({
      where: {
        huelineId,
      },
      select: { id: true },
    });

    if (!booking) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const newCall = await prisma.call.create({
      data: {
        callSid,
        status: "PROCESSING",
        subdomain: { connect: { id: subdomain.id } },
        customer: { connect: { id: customerId } },
        bookingData: { connect: { id: booking.id } },
      },
    });

    const newJob = await prisma.job.create({
      data: {
        initiator: "SYSTEM",
        jobType: "VOICE",
        status: "PROCESSING",
        customer: { connect: { id: customerId } },
        huelineId,
        model: "assemblyai",
        metadataSource: "VOICE",
        metadata: {
          to,
          from,
          duration,
          callSid,
          callId: newCall.id,
          bookingId: booking.id,
        } satisfies VoiceMetadata,
      },
    });

    await triggerIntelligenceLambda({
      call_sid: callSid,
      hueline_id: huelineId,
      slug,
      domain_id: subdomain.id,
      job_id: newJob.id,
    });

    return NextResponse.json({ job_id: newJob.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
