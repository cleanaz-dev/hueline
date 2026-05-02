import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing file key" }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    });

    // Generate a fresh URL valid for 1 hour
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Instantly redirect the browser's image tag to the fresh AWS URL
    return NextResponse.redirect(presignedUrl);

  } catch (error) {
    console.error("Presign error:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}