import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToS3 } from "@/lib/aws/s3/services";

interface Params {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;

    // Verify user owns this booking
    if (session.user.id !== bookingId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Upload to S3
    const uploadedKeys = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const timestamp = Date.now();
      const key = `clients/${bookingId}/images/${timestamp}-${file.name}`;

      await uploadToS3(buffer, key, file.type);
      uploadedKeys.push(key);
    }

    // Store keys in Redis
    // TODO: Add redis logic here to append to existing booking data

    return NextResponse.json({
      success: true,
      keys: uploadedKeys,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
