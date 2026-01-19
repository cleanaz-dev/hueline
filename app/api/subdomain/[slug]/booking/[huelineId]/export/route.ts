// app/api/subdomain/[slug]/booking/[huelineId]/export/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface Params {
  params: Promise<{
    huelineId: string;
    slug: string;
  }>;
}

// Create new export job
export async function POST(req: Request, { params }: Params) {
  const { huelineId, slug } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageKeys, resolution, phone } = body;

    if (!imageKeys?.length || !resolution || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: {
        twilioPhoneNumber: true,
        id: true,
      },
    });

    if (!subdomain) {
      return NextResponse.json(
        { error: "Invalid Data Request" },
        { status: 400 },
      );
    }

    // Get booking ID
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: { id: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Call Lambda
    const lambdaResponse = await fetch(process.env.LAMBDA_EXPORT_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subdomain_id: subdomain.id,
        slug,
        hueline_id: huelineId,
        image_keys: imageKeys,
        resolution,
        phone,
        twilio_from: subdomain.twilioPhoneNumber,
      }),
    });

    if (!lambdaResponse.ok) {
      throw new Error("Lambda request failed");
    }

    const { job_id } = await lambdaResponse.json();

    // Create export record
    await prisma.export.create({
      data: {
        jobId: job_id,
        bookingId: booking.id,
        resolution,
        imageCount: imageKeys.length,
        status: "processing",
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job_id,
      message: "Export started. You'll receive an SMS when ready.",
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Update existing export (called by Lambda)
export async function PATCH(req: Request, { params }: Params) {
  try {
    const headersList = await headers();
    const apiKey = headersList.get("x-api-key");

    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, status, downloadUrl, completedAt, error } = body;

    const updatedExport = await prisma.export.update({
      where: { jobId },
      data: {
        status,
        ...(downloadUrl && { downloadUrl }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
        ...(error && { error }),
      },
    });

    return NextResponse.json({ success: true, export: updatedExport });
  } catch (error) {
    console.error("Error updating export:", error);
    return NextResponse.json(
      { error: "Failed to update export" },
      { status: 500 },
    );
  }
}