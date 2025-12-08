// app/api/subdomain/[slug]/booking/[huelineId]/get-presigned-urls/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/aws/s3/services";
import { getBookingForPresignedUrls } from "@/lib/prisma/mutations/s3key/get-booking-for-presigned-urls";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; huelineId: string }> }
) {
  try {
    const { slug, huelineId } = await params;
    
       const booking = await getBookingForPresignedUrls(huelineId, slug);
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Generate presigned URL for original image
    const originalImages = await getPresignedUrl(booking.originalImages);

    // Generate presigned URLs for all mockups
    const mockups = await Promise.all(
      booking.mockups.map(async (mockup) => ({
        ...mockup,
        presignedUrl: await getPresignedUrl(mockup.s3Key),
      }))
    );

    return NextResponse.json({
      originalImages,
      mockups,
    });
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URLs" },
      { status: 500 }
    );
  }
}