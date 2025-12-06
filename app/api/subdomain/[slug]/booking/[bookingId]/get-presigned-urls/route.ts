// app/api/subdomain/[slug]/booking/[bookingId]/get-presigned-urls/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/aws/s3/services";
import { getBookingByIdSlug } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; bookingId: string }> }
) {
  try {
    const { slug, bookingId } = await params;
    
    const data = await getBookingByIdSlug(bookingId, slug);
    if (!data || data.bookings.length === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const booking = data.bookings[0];

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