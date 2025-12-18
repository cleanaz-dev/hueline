import { handleNewS3Key } from "@/lib/aws/s3";
import { getNewMockUpColorMoonshot } from "@/lib/moonshot";
import { prisma } from "@/lib/prisma";
import { updateMockupData } from "@/lib/prisma/mutations/booking-data";
import { createMockupLog } from "@/lib/prisma/mutations/logs/create-mockup-log";
import { getOriginalImageUrl } from "@/lib/prisma/mutations/s3key";
import { generateMockup } from "@/lib/replicate";
import { getColorMatch } from "@/lib/utils/color-match-lambda";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    huelineId: string;
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { huelineId, slug } = await params;

  try {
    // Need to await the JSON parsing
    const body = await req.json();

    const subdomain = await prisma.subdomain.findUnique({
      where: {
        slug,
        bookings: {
          some: {
            huelineId: huelineId,
          },
        },
      },
      select: {
        id: true,
      },
    });
    const booking = await prisma.subBookingData.findUnique({
      where: {
        huelineId,
      },
      select: {
        id: true,
      },
    });

    if (!subdomain || !booking) {
      return NextResponse.json(
        {
          message: "Missing required data",
        },
        { status: 400 }
      );
    }

    const subdomainId = subdomain.id;

    const { option, currentColor, removeFurniture } = body;
    console.log("📦 Request body:", body);

    const color = currentColor[0];

    if (!option || !color) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }
    const { originalImageUrl, roomType } = await getOriginalImageUrl(huelineId);

    if (!originalImageUrl && !roomType) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const { colorPrompt, colorChoice, extractedNewColor } =
      await getNewMockUpColorMoonshot(color, option);

    // Generate mockup
    const mockupUrl = await generateMockup(
      colorPrompt,
      originalImageUrl,
      removeFurniture
    );

    const anchorHex = colorChoice.hex;

    const safeMockupUrl = String(mockupUrl);

    console.log(
      "📦 Data for Color Match:",
      safeMockupUrl,
      anchorHex,
      extractedNewColor
    );

    const { ral, name, hex } = await getColorMatch(
      safeMockupUrl,
      anchorHex,
      extractedNewColor
    );

    const s3key = await handleNewS3Key({
      url: mockupUrl,
      huelineId,
      subdomainId,
      isMockup: true,
    });

    const newColorChoice = {
      ral,
      name,
      hex,
    };

    const newMockupData = await updateMockupData(
      huelineId,
      s3key,
      newColorChoice,
      roomType
    );

    console.log("Updated Booking:", newMockupData);

    // CREATE THE MOCKUP LOG
    await createMockupLog({
      bookingDataId: booking.id,
      subdomainId: subdomainId,
      roomType: roomType,
      color: newColorChoice,
      option: option,
      removeFurniture: removeFurniture || false,
      s3Key: s3key, // Include the s3Key - good for debugging/tracking
    });

    return NextResponse.json(
      {
        message: "success",
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
