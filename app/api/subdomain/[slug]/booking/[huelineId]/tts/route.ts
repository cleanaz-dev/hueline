import { NextRequest, NextResponse } from "next/server";
import { readSummary } from "@/lib/deepgram/services/read-summary";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string,
    huelineId: string
  }>
}

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { slug, huelineId } = await params;

    // Fetch the subdomain with the specific booking
    const subdomain = await prisma.subdomain.findFirst({
      where: { slug },
      include: {
        bookings: {
          where: {
            huelineId: huelineId
          },
          select: {
            summary: true,
          }
        }
      }
    });

    // Check if subdomain or booking exists
    if (!subdomain || !subdomain.bookings || subdomain.bookings.length === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const booking = subdomain.bookings[0];
    
    if (!booking.summary) {
      return NextResponse.json(
        { error: "No summary available for this booking" },
        { status: 404 }
      );
    }

    // Get audio from Deepgram
    const audioResponse = await readSummary(booking.summary);
    
    // Get the audio buffer
    const audioBuffer = await audioResponse.arrayBuffer();

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}