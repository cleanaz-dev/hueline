import { NextResponse } from "next/server";
import { getMockUpColorMoonshot } from "@/lib/moonshot";
import { generateMockup } from "@/lib/replicate/services";
import { extractMainHue } from "@/lib/utils";
import { getPresignedUrl, uploadMockupToS3 } from "@/lib/aws/s3";
import { getOriginalImageS3Key } from "@/lib/redis";
import { updateBookingWithMockData } from "@/lib/redis/services/update-booking-with-mockdata";

interface Params {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { bookingId } = await params;

  try {
    const body = await req.json();

    const { option, currentColor, removeFurniture } = body;

    // Extract first color from array
    const color = currentColor[0];
    const { originalImageS3Key, roomType } = await getOriginalImageS3Key(bookingId);
    
    const preSignedUrl = await getPresignedUrl(originalImageS3Key);

    // Get hue using imported function
    const mainHue = extractMainHue(color.name);

    const newColor = await getMockUpColorMoonshot(option, color, mainHue);

    const colorPrompt = `Apply color ${color.name}, ${color.hex} to the walls of room`;
    console.log("PresignedUrl:", preSignedUrl);

    const mockupUrl = await generateMockup(
      colorPrompt,
      preSignedUrl,
      removeFurniture
    );

    const newS3Key = await uploadMockupToS3(mockupUrl, bookingId);

    const updatedBooking = await updateBookingWithMockData(
      newS3Key,
      roomType,
      color,
      bookingId
    );

    console.log("Updated Booking:", updatedBooking);

    return NextResponse.json(
      {
        message: "success",
        color: newColor,
        bookingId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in color generation:", error);
    return NextResponse.json(
      {
        message: "Error Generating New Mockup",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
