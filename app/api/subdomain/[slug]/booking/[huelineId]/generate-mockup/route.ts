import { handleNewS3Key } from "@/lib/aws/s3";
import { getNewMockUpColorMoonshot } from "@/lib/moonshot";
import { updateMockupData } from "@/lib/prisma/mutations/booking-data";
import { getOriginalImageUrl } from "@/lib/prisma/mutations/s3key";
import { generateMockup } from "@/lib/replicate";
import { generateAltMockup } from "@/lib/replicate-old";
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

    const { option, currentColor, removeFurniture } = body;
    console.log("📦 Request body:", body);

    const color = currentColor[0];

    if (!option || !color || !removeFurniture) {
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

    const { colorPrompt, colorChoice } = await getNewMockUpColorMoonshot(
      color,
      option
    );

    // Generate mockup
    const mockupUrl = await generateMockup(
      colorPrompt,
      originalImageUrl,
      removeFurniture
    );

    const s3key = await handleNewS3Key(mockupUrl, huelineId);

    const newMockupData = await updateMockupData(
      huelineId,
      s3key,
      colorChoice,
      roomType
    );

    console.log("Updated Booking:", newMockupData);

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
