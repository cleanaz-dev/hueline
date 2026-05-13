import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import {
  LambdaUpscalePayload,
  upscalePayloadSchema,
} from "@/lib/zod/lambda-upscale-payload";
import { getPresignedUrls } from "@/lib/aws/s3/services/get-presigned-url";
import { ImageUpscaleMetadata } from "@/lib/zod/job-upscale-metadata";

interface Params {
  params: Promise<{
    huelineId: string;
    slug: string;
  }>;
}

const lambdaUrl = process.env.LAMBDA_EXPORT_URL!;

// GET exports for SWR polling
export async function GET(req: Request, { params }: Params) {
  const { huelineId } = await params;

  try {
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: {
        exports: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ exports: booking.exports });
  } catch (error) {
    console.error("Error fetching exports:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
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
    const { imageKeys, resolution, phone, roomType } = body;

    if (!imageKeys?.length || !resolution || !phone || !roomType) {
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

    if (!subdomain || !subdomain.twilioPhoneNumber) {
      return NextResponse.json(
        { error: "Invalid Data Request" },
        { status: 400 },
      );
    }

    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: {
        id: true,
        customer: true,
      },
    });

    if (!booking || !booking.customer) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const imageUrls = await getPresignedUrls(imageKeys, 3600);

    const exportData = await prisma.export.create({
      data: {
        status: "PENDING",
        bookingId: booking.id,
        resolution,
        imageCount: imageKeys.length,
      },
    });

    const systemTask = await prisma.systemTask.create({
      data: {
        initiator: "CLIENT",
        type: "UPSCALE",
        status: "PENDING",
        model: "novita/image-upscaler",
        cost: 0.01,
        huelineId,
        deliveryMethod: "SMS",
        customer: { connect: { id: booking.customer.id } },
        metadataSource: "UPSCALE",
        metadata: {
          resolution: resolution,
          exportId: exportData.id,
          imageCount: imageKeys.length,
          twilioFromNumber: subdomain.twilioPhoneNumber,
          phoneNumber: phone,
          s3Keys: imageKeys,
          roomType,
        } satisfies ImageUpscaleMetadata,
      },
    });

    await prisma.export.update({
      where: { id: exportData.id },
      data: {
        systemTaskId: systemTask.id,
      },
    });

    const upscalePayload: LambdaUpscalePayload = {
      subdomainId: subdomain.id,
      huelineId: huelineId,
      imageUrls,
      resolution,
      systemTaskId: systemTask.id,
      action: "IMAGE_UPSCALE",
    };

    const parsed = upscalePayloadSchema.safeParse(upscalePayload);

    if (!parsed.success) {
      console.error("Invalid payload:", parsed.error.issues);
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }
    const lambdaRes = await axios.post(lambdaUrl, upscalePayload);

    if (lambdaRes.status !== 200) {
      await prisma.systemTask.update({
        where: { id: systemTask.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: "Failed to start export" },
        { status: 500 },
      );
    }

    await prisma.systemTask.update({
      where: { id: systemTask.id },
      data: { status: "PROCESSING" },
    });

    return NextResponse.json({
      success: true,
      systemTaskId: systemTask.id,
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
