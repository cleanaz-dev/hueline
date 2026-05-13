import { handleNewS3Key, getPresignedUrl } from "@/lib/aws/s3";
import { getNewMockUpColorMoonshot } from "@/lib/moonshot";
import { resolveNewColor } from "@/lib/moonshot/services/resolve-color";
import { prisma } from "@/lib/prisma";
import { updateMockupData } from "@/lib/prisma/mutations/booking-data";
import { createMockupLog } from "@/lib/prisma/mutations/logs/create-mockup-log";
import { getOriginalImageUrl } from "@/lib/prisma/mutations/s3key";
import { generateMockup } from "@/lib/replicate";
import { lambdaPayloadSchema, type LambdaImagenPayload } from "@/lib/zod";
// import { getColorMatch } from "@/lib/utils/color-match-lambda";
import {
  CurrentColor,
  TargetColor,
  MoonShotColorChoice,
} from "@/types/paint-types";
import axios from "axios";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    huelineId: string;
    slug: string;
  }>;
}

const lambdaUrl = process.env.LAMBDA_IMAGEN_URL!;

export async function POST(req: Request, { params }: Params) {
  const { huelineId, slug } = await params;

  try {
    const body = await req.json();
    const {
      option,
      currentColor,
      removeFurniture,
      targetColor,
    }: {
      option: string;
      currentColor: CurrentColor[];
      removeFurniture: boolean;
      targetColor?: TargetColor;
    } = body;
    console.log("📦 Request body:", body);

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
        originalImages: true,
        customer: true,
      },
    });

    if (!subdomain || !booking || !booking.customer?.id) {
      return NextResponse.json(
        { message: "Missing required data" },
        { status: 400 },
      );
    }

    const color = currentColor[0];

    if (!option || !color) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const { originalImageUrl, roomType } = await getOriginalImageUrl(huelineId);

    if (!originalImageUrl && !roomType) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const newColor = await resolveNewColor(option, color, targetColor);

    console.log("New Color:", newColor);

    const systemTask = await prisma.systemTask.create({
      data: {
        initiator: "CLIENT",
        type: "IMAGEN",
        status: "PENDING",
        brand: newColor.brand,
        hex: newColor.hex,
        code: newColor.code,
        name: newColor.name,
        cost: 0.13,
        huelineId: huelineId,
        model: "openai/gpt-image-2",
        deliveryMethod: "SMS",
        customer: { connect: { id: booking.customer?.id } },
      },
    });

    const generatePayload: LambdaImagenPayload = {
      customerId: booking.customer?.id,
      imageUrl: originalImageUrl,
      targetColor: newColor,
      huelineId: huelineId,
      subdomainId: subdomain.id,
      action: "CLIENT_IMAGEN",
      systemTaskId: systemTask.id,
    };

    const parsed = lambdaPayloadSchema.safeParse(generatePayload);
    if (!parsed.success) {
      console.error("Invalid payload:", parsed.error.issues);
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await axios.post(lambdaUrl, generatePayload);

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error in color generation:", error);
    return NextResponse.json(
      {
        message: "Error Generating New Mockup",
        error: String(error),
      },
      { status: 500 },
    );
  }
}
