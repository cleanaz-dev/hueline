import { NextResponse } from "next/server";
import { createMockupBooking } from "@/lib/prisma/mutations/booking-data/create-mockup-booking";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    if(!slug) return NextResponse.json({message: "Invalid Parameters, Missing Slug"}, {status: 400})
    const body = await req.json();

    const result = await createMockupBooking(body);

    return NextResponse.json({ 
      success: true, 
      huelineId: result.booking.huelineId,
    });
  } catch (error) {
    console.error("Mockup Ingest Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}