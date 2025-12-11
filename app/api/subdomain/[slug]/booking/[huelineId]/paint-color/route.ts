import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    huelineId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { slug, huelineId } = await params;

    // 1. Parse Payload from Lambda
    const body = await req.json();
    const { 
      ral, 
      englishName, 
      hex, 
      mockup_url, // URL from Replicate/DALL-E
      roomType = "Living Room" // Default fallback
    } = body;

    if (!slug || !huelineId) {
      return NextResponse.json({ error: "Missing slug/id" }, { status: 400 });
    }

    // 2. Find the Parent Booking
    // We MUST find it first. We cannot 'upsert' the parent because we lack 
    // required fields (Name, Phone, etc.) from this specific Lambda payload.
    const booking = await prisma.subBookingData.findFirst({
      where: {
        huelineId: huelineId,
        subdomain: { slug: slug },
      },
    });

    if (!booking) {
      console.error(`❌ Booking ${huelineId} not found. Cannot attach color.`);
      return NextResponse.json(
        { error: "Parent booking not found. Cannot create ghost record." },
        { status: 404 }
      );
    }

    console.log(`🎨 Updating Booking ${huelineId}:`, { ral, hex });

    // 3. Transaction: Update Paint & Mockup
    // We use a transaction to ensure both records are created/updated simultaneously.
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Clean up old entries (Optional: Prevents duplicates if Lambda runs twice)
      await tx.paintColor.deleteMany({ where: { bookingDataId: booking.id } });
      // Note: We might want to keep old mockups, but usually we want the "latest" one linked to the color.
      // If you want to keep history, remove the deleteMany below.
      // await tx.mockup.deleteMany({ where: { bookingDataId: booking.id } });

      // B. Create Paint Color Record
      const paintColor = await tx.paintColor.create({
        data: {
          ral: ral,
          name: englishName || "Unknown",
          hex: hex,
          bookingDataId: booking.id, // Link to Parent
        },
      });

      // C. Create Mockup Record
      // Schema requires: s3Key, roomType, colorRal, colorName, colorHex
      const mockup = await tx.mockup.create({
        data: {
          s3Key: mockup_url, // Storing the Replicate URL here
          roomType: roomType,
          colorRal: ral,
          colorName: englishName || "Unknown",
          colorHex: hex,
          presignedUrl: mockup_url, // Redundant but good for frontend ease
          bookingDataId: booking.id, // Link to Parent
        },
      });

      return { paintColor, mockup };
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}