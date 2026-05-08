import { PrismaClientRustPanicError } from "@/app/generated/prisma/runtime/library";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    huelineId: string;
  }>;
}

const webhookSecret = process.env.LAMBDA_WEBHOOK_SECRET;

export async function POST(req: Request, { params }: Params) {
  const { huelineId, slug } = await params;

  try {
    const body = await req.json();
    const authHeaders = req.headers.get("x-webhook-secret");

    console.log("Booking Ingest MockUp:", body);

    const bookingData = await prisma.subBookingData.findFirst({
      where: {
        huelineId,
      },
      select: { id: true },
    });

    if (!huelineId || !slug || !bookingData) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 401 });
    }

    const { s3Key, colorName, colorHex, colorCode, colorBrand, roomType } =
      body;

    const newMockup = await prisma.mockup.create({
        data: {
            bookingData: {connect: {id: bookingData.id }},
            brand: colorBrand,
            code: colorCode,
            hex: colorHex,
            roomType: roomType,
            name: colorName,
            s3Key,
        }
    })

    const paintColors = await prisma.paintColor.create({
        data: {
            bookingData: {connect: {id: bookingData.id }},
            brand: colorBrand,
            code: colorCode,
            hex: colorHex,
            name: colorName,
        }
    })

    await prisma.clientCommunication.create({
        data: {
            body: "New Mockup Generated",
            type: "IMAGEN",
            role: "CLIENT",
            mediaAttachments: {create: [
                {
                    filename: `${paintColors.brand}-${paintColors.name}-${paintColors.code}`,
                    mimeType: "image/jpeg",
                    size: 10000,
                    mediaUrl: newMockup.s3Key,
                    mediaSource: "S3",

                }
            ]}
        }
    })

    console.log("Paint Colors:", paintColors, "Mockup:", newMockup)
  } catch (error) {}

  return NextResponse.json({ message: "ok" }, { status: 200 });
}
