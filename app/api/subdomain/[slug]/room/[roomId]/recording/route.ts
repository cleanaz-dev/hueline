import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface RouteParams {
  params: Promise <{
    slug: string;
    roomId: string;
  }>;
}

// Initialize S3 Client (Best to put this in a lib/s3.ts file if reused)
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug, roomId } = await params;

    // 1. Security Check: Ensure Room belongs to this Subdomain
    const room = await prisma.room.findFirst({
      where: {
        roomKey: roomId, // or id: roomId, depending on your URL structure
        domain: {
          slug: slug,
        },
      },
      select: {
        recordingUrl: true, // We fetch the key from DB to be secure
      },
    });

    if (!room || !room.recordingUrl) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    // 2. Generate Signed URL
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: room.recordingUrl, // The S3 Key stored in your DB
    });

    // URL expires in 15 minutes (900 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("[GET_RECORDING_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to generate video link" },
      { status: 500 }
    );
  }
}