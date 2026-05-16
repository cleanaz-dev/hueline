import { S3_BUCKET_NAME, getUploadPresignedUrl } from "@/lib/aws/s3"; // <-- Import the new helper
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    designId: string; 
  }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { slug, designId } = await params;

    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!subdomain) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    // Parse file metadata sent from the frontend context
    const body = await req.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json({ message: "Missing file details" }, { status: 400 });
    }

    // Create a unique S3 Key
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `subdomains/${subdomain.id}/designs/${designId}/${Date.now()}-${safeFilename}`;

    // GENERATE THE UPLOAD URL!
    // Pass both the key AND the contentType
    const uploadUrl = await getUploadPresignedUrl(key, contentType);

    // Construct the final public URL 
    const finalImageUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

    return NextResponse.json({
      uploadUrl,
      finalImageUrl,
    });

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { message: "Failed to generate upload URL" }, 
      { status: 500 }
    );
  }
}