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

interface Params {
  params: Promise<{
    slug: string;
    callSid: string;
  }>
}

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { slug, callSid } = await params;

    // Get the subdomain
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
    });

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain not found" },
        { status: 404 }
      );
    }

    const call = await prisma.call.findFirst({
      where: {
        subdomainId: subdomain.id,
        callSid: callSid,
      },
      select: {
        audioUrl: true
      }
    });

    if (!call || !call.audioUrl) {
      return NextResponse.json(
        { error: "No audio recording found" },
        { status: 404 }
      );
    }

    // Generate a presigned URL from the S3 key
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: call.audioUrl,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
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