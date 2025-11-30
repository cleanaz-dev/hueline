import { NextResponse } from "next/server";
import { getMockUpColorMoonshot } from "@/lib/moonshot";

interface Params {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { bookingId } = await params;
  try {
    const body = await req.json();
    console.log("body:", body, "BookingId:", bookingId);

    const { option, currentColor } = body;

    const color = await getMockUpColorMoonshot(option, currentColor);
    
    console.log("Current color:", currentColor);


    return NextResponse.json({ 
      message: "success", 
      color,
      bookingId 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in color generation:", error);
    return NextResponse.json(
      { message: "Error Generating New Mockup", error: String(error) },
      { status: 500 }
    );
  }
}