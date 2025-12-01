// app/api/booking/[bookingId]/get-presigned-urls/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPresignedUrl } from "@/lib/aws/s3/services";
import { getBooking } from "@/lib/redis";

interface RouteContext {
  params: Promise<{
    bookingId: string;
  }>;
}

interface Mockup {
  s3_key: string;
  room_type: string;
  color: string;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await context.params;

    if (session.user.id !== bookingId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Handle original_images (could be string or array)
    const originalKeys = Array.isArray(booking.original_images) 
      ? booking.original_images 
      : [booking.original_images];
    
    const originalUrls = await Promise.all(
      originalKeys.map((s3Key: string) => getPresignedUrl(s3Key, 3600))
    );

    // Convert mockup s3_key to presigned URLs
    const mockupUrls = await Promise.all(
      (booking.mockup_urls || []).map(async (mockup: Mockup) => ({
        url: await getPresignedUrl(mockup.s3_key, 3600),
        room_type: mockup.room_type,
        color: mockup.color
      }))
    );

    return NextResponse.json({ 
      original_images: originalUrls,
      mockup_urls: mockupUrls
    });
  } catch (error) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate URLs" },
      { status: 500 }
    );
  }
}