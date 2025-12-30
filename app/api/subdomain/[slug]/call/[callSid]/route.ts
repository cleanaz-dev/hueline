import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const huelineId = searchParams.get("huelineId");

    if (!huelineId) {
      return NextResponse.json(
        { error: "huelineId is required" },
        { status: 400 }
      );
    }

    // Get the subdomain
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug: params.slug },
    });

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain not found" },
        { status: 404 }
      );
    }

    // Get the booking with the lastCallAudioUrl (S3 key)
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: { lastCallAudioUrl: true },
    });

    if (!booking || !booking.lastCallAudioUrl) {
      return NextResponse.json(
        { error: "No audio recording found" },
        { status: 404 }
      );
    }

    // Generate a presigned URL from the S3 key
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: booking.lastCallAudioUrl, // This should always be an S3 key like "subdomains/xyz/audio/123.mp3"
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 120, // 1 hour
    });

    return NextResponse.json({ url: presignedUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate audio URL" },
      { status: 500 }
    );
  }
}