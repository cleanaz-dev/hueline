import { NextResponse } from "next/server";
import { getMockUpColorMoonshot } from "@/lib/moonshot";
import { generateMockup } from "@/lib/replicate/services";
import { extractMainHue } from "@/lib/utils";
import { getPresignedUrl, uploadMockupToS3 } from "@/lib/aws/s3";
import { getOriginalImageS3Key } from "@/lib/redis";
import { updateBookingWithMockData } from "@/lib/redis/services/update-booking-with-mockdata";
import { extractHex } from "@/lib/moonshot/services/extract-hex";
import { selectClosestRAL } from "@/lib/moonshot/services/select-closest-ral";

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
    console.log("📦 Request body:", body);

    const color = currentColor[0];
    const { originalImageS3Key, roomType } = await getOriginalImageS3Key(bookingId);
    
    const preSignedUrl = await getPresignedUrl(originalImageS3Key);

    const mainHue = extractMainHue(color.name);
    console.log("🔎 Main Hue:", mainHue)

    const newColor = await getMockUpColorMoonshot(option, color, mainHue);
    console.log("🎨 New Color:", newColor)

    const colorPrompt = `Apply color: ${newColor.hex} to the walls of room`;
    console.log("PresignedUrl:", preSignedUrl);

    // Generate mockup
    const mockupUrl = await generateMockup(
      colorPrompt,
      preSignedUrl,
      removeFurniture
    );

    // // Upload to S3 and get the new S3 key
    const newS3Key = await uploadMockupToS3(mockupUrl, bookingId);
    
    // // Get presigned URL for the newly uploaded mockup
    const mockupPresignedUrl = await getPresignedUrl(newS3Key);

    // // Extract hex color from the generated mockup
    const extractedColor = await extractHex(mockupPresignedUrl);
    
    let ralColor = null;
    if (extractedColor) {
      // Select closest RAL color based on extracted hex
      ralColor = await selectClosestRAL(extractedColor);
      console.log("🎨 Closest RAL color:", ralColor);
    }

    // // Update booking with mockup data and RAL color
    const updatedBooking = await updateBookingWithMockData(
      newS3Key,
      roomType,
      ralColor || color, // Use RAL color if available, otherwise use original color
      bookingId
    );

    console.log("Updated Booking:", updatedBooking);

    return NextResponse.json(
      {
        message: "success",
        color: newColor,
        ralColor: ralColor,
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