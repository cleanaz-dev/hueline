import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    const authHeader = req.headers.get("x-webhook-secret");
    if (authHeader !== process.env.LAMBDA_WEBHOOK_SECRET) {
      console.warn(`Unauthorized webhook attempt for prospect: ${id}`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { s3Key, brand, color } = await req.json();

    if (!s3Key) {
      return NextResponse.json({ message: "Missing s3Key" }, { status: 400 });
    }

    const demoClient = await prisma.demoClient.findUnique({
      where: { id },
      include: { subBookingData: true },
    });

    if (!demoClient) {
      return NextResponse.json({ message: "Prospect not found" }, { status: 404 });
    }

    if (demoClient.subBookingData) {
      await prisma.subBookingData.update({
        where: { id: demoClient.subBookingData.id },
        data: {
          mockups: {
            create: {
              s3Key,
              roomType: demoClient.subBookingData.roomType,
              brand: brand ?? 'RAL',
              name: color?.name,
              hex: color?.hex,
              code: color?.id,
            },
          },
        },
      });
    }

    await prisma.clientCommunication.create({
      data: {
        demoClientId: id,
        role: "OPERATOR",
        type: "EMAIL",
        body: `Here is your new mockup featuring the ${brand} palette in ${color?.name || "your selected color"}!`,
        mediaAttachments: {
          create: {
            mediaUrl: s3Key,
            mimeType: "image/jpeg",
            filename: `${brand}-mockup.jpg`,
            size: 0,
            mediaSource: "S3",
          },
        },
      },
    });
    // TO DO SEND EMAIL
    

    return NextResponse.json({ message: "Email mockup ingested successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Ingest Email Error for ${id}:`, error.message || error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}