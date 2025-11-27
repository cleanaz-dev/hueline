// app/api/booking/[bookingId]/get-presigned-urls/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPresignedUrl } from "@/lib/aws/s3/services";
import { getImageKeys } from "@/lib/redis";

interface Params {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function GET(request: Request, { params }: Params) {
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

    // Get S3 keys from Redis (already parsed)
    const imageData = await getImageKeys(bookingId);

    if (!imageData || imageData.length === 0) {
      return NextResponse.json({ images: [] });
    }

    // Generate presigned URLs for each S3 key
    const presignedUrls = await Promise.all(
      imageData.map(async (img: { s3_key: string }) => {
        return await getPresignedUrl(img.s3_key, 3600);
      })
    );

    return NextResponse.json({ images: presignedUrls });
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate URLs" },
      { status: 500 }
    );
  }
}