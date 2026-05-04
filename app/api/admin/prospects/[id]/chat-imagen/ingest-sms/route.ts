import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SendImageSMS } from "@/lib/twilio/twilio-send-image";
import { getPresignedUrl } from "@/lib/aws/s3";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    // 1. Security Check
    const authHeader = req.headers.get("x-webhook-secret");
    if (authHeader !== process.env.LAMBDA_WEBHOOK_SECRET) {
      console.warn(`Unauthorized SMS webhook attempt for prospect: ${id}`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    const { s3Key, brand, colorName, targetColor, roomType, action, smsBody, huelineId } = await req.json();

    if (!s3Key) {
      return NextResponse.json({ message: "Missing s3Key" }, { status: 400 });
    }

    // 3. Generate presigned URL
    const presignedUrl = await getPresignedUrl(s3Key);

    // 4. Verify prospect exists
    const demoClient = await prisma.demoClient.findUnique({
      where: { id },
    });

    if (!demoClient) {
      return NextResponse.json({ message: "Prospect not found" }, { status: 404 });
    }

    if (!demoClient.phone) {
      return NextResponse.json({ message: "Prospect has no phone number" }, { status: 400 });
    }

    if (action === "followUp") {
      // Update SubBookingData with new mockup and paint color
      const subBookingData = await prisma.subBookingData.update({
        where: { huelineId },
        include: { subdomain: true },
        data: {
          mockups: {
            create: {
              s3Key,
              roomType,
              colorRal: targetColor.code,
              colorName: targetColor.name,
              colorHex: targetColor.hex,
            },
          },
          paintColors: {
            create: {
              ral: targetColor.code,
              name: targetColor.name,
              hex: targetColor.hex,
            },
          },
        },
      });

      const portalLink = `https://${subBookingData.subdomain.slug}.hue-line.com/j/${huelineId}`;
      const fullBody = `${smsBody}\n\nView your portal here: ${portalLink}`;

      await prisma.clientCommunication.create({
        data: {
          demoClientId: id,
          role: "OPERATOR",
          type: "SMS",
          body: fullBody,
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

      await SendImageSMS({
        to: demoClient.phone,
        body: fullBody,
        imageUrl: [presignedUrl],
      });

      return NextResponse.json({ message: "Success" }, { status: 200 });
    }

    // 5. Default path
    const communication = await prisma.clientCommunication.create({
      data: {
        demoClientId: id,
        role: "OPERATOR",
        type: "SMS",
        body: `Here is your new mockup featuring the ${brand} palette in ${colorName || "your selected color"}!`,
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

    await SendImageSMS({
      to: demoClient.phone,
      body: communication.body,
      imageUrl: [presignedUrl],
    });

    return NextResponse.json({ message: "SMS mockup ingested successfully" }, { status: 200 });

  } catch (error: any) {
    console.error(`Ingest SMS Error for ${id}:`, error.message || error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}