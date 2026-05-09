import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

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

    const { s3Key, brand, color, jobId } = await req.json();

    if (!s3Key || !jobId) {
      return NextResponse.json({ message: "Missing s3Key and Job ID" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId
      }
    })

    const demoClient = await prisma.demoClient.findUnique({
      where: { id },
      include: { subBookingData: true },
    });

    if (!demoClient || !job) {
      return NextResponse.json({ message: "Data not found" }, { status: 404 });
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
    // // TO DO SEND EMAIL
    // await sendEmail(
    //   {
    //     to: "",
    //     subject: "",
    //     template: MockupTemplate: {

    //     }
    //   }

    // )
    

    return NextResponse.json({ message: "Email mockup ingested successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Ingest Email Error for ${id}:`, error.message || error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}