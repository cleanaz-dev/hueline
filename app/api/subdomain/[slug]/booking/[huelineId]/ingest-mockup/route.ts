import { s3Client, S3_BUCKET_NAME } from "@/lib/aws/s3";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    huelineId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { huelineId, slug } = await params;

  try {
    const body = await req.json();

    console.log("Booking Ingest MockUp:", body);

    const bookingData = await prisma.subBookingData.findFirst({
      where: { huelineId },
      select: { id: true },
    });

    if (!huelineId || !slug || !bookingData) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 401 });
    }

    const { s3Key, colorName, colorHex, colorCode, colorBrand, roomType } = body;

    const head = await s3Client.send(new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    }));

    const mimeType = head.ContentType ?? "image/jpeg";
    const size = head.ContentLength ?? 0;

    const newMockup = await prisma.mockup.create({
      data: {
        bookingData: { connect: { id: bookingData.id } },
        brand: colorBrand,
        code: colorCode,
        hex: colorHex,
        roomType: roomType,
        name: colorName,
        s3Key,
      },
    });

    const paintColors = await prisma.paintColor.create({
      data: {
        bookingData: { connect: { id: bookingData.id } },
        brand: colorBrand,
        code: colorCode,
        hex: colorHex,
        name: colorName,
      },
    });

    await prisma.clientCommunication.create({
      data: {
        body: "New Mockup Generated",
        type: "IMAGEN",
        role: "CLIENT",
        mediaAttachments: {
          create: [{
            filename: `${paintColors.brand}-${paintColors.name}-${paintColors.code}`,
            mimeType,
            size,
            mediaUrl: newMockup.s3Key,
            mediaSource: "S3",
          }],
        },
      },
    });

    console.log("Paint Colors:", paintColors, "Mockup:", newMockup);
  } catch (error) {
    console.error("Ingest mockup error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }

  return NextResponse.json({ message: "ok" }, { status: 200 });
}