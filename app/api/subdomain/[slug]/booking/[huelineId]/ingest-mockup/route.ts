import { s3Client, S3_BUCKET_NAME, getPresignedUrl } from "@/lib/aws/s3";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
// Update this import path/name if you saved it differently!
import { processImagenWorkflow } from "@/lib/twilio/process-imagen-workflow";

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
      select: { 
        id: true,
        // Assuming your demoClient model includes id, phone, and firstName 
        demoClient: true, 
      },
    });

    if (!huelineId || !slug || !bookingData || !bookingData.demoClient || !bookingData.demoClient.phone) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 401 });
    }

    const { s3Key, colorName, colorHex, colorCode, colorBrand, roomType } = body;

    // Fetch metadata from S3
    const head = await s3Client.send(new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
    }));

    const mimeType = head.ContentType ?? "image/jpeg";
    const size = head.ContentLength ?? 0;
    const publicUrl = await getPresignedUrl(s3Key)

    // Save Mockup
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

    // Save Paint Colors
    const paintColors = await prisma.paintColor.create({
      data: {
        bookingData: { connect: { id: bookingData.id } },
        brand: colorBrand,
        code: colorCode,
        hex: colorHex,
        name: colorName,
      },
    });

    // --- PREPARE DATA FOR WORKFLOW ---
    
    // Construct the full S3 URL for Twilio
    const mediaUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
    
    // Extract the exact file name
    const fileName = s3Key.split('/').pop() || s3Key;

    // Formulate the SMS message (added a fallback to "there" just in case firstName is null)
    const recipientName = bookingData.demoClient.name || "there";
    const smsBody = `Hey ${recipientName}, here is your ${roomType ? roomType.toLowerCase() : 'room'} preview with ${colorBrand} ${colorName}!`;

    // --- FIRE THE OMNICHANNEL WORKFLOW ---
    
    await processImagenWorkflow({
      to: bookingData.demoClient.phone, // Requires a valid phone number from the DB
      body: smsBody,
      demoClientId: bookingData.demoClient.id,
      mediaData: {
        mediaUrl: mediaUrl,
        size: size,
        mimeType: mimeType,
        fileName: fileName,
      },
      role: "CLIENT", 
      triggerSource: "CLIENT_PORTAL",
      metadata: { 
        mockupId: newMockup.id, 
        s3Key: s3Key 
      },
      context: {
        brandName: colorBrand,
        colorName: colorName,
        colorHex: colorHex,
        recipientName: recipientName, 
        roomType: roomType,
      }
    });

    console.log("Paint Colors:", paintColors, "Mockup:", newMockup);
  } catch (error) {
    console.error("Ingest mockup error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }

  return NextResponse.json({ message: "ok" }, { status: 200 });
}