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

    // Extract first color from array
    const color = currentColor[0];
    
    // Extract hue from color name
    const hueKeywords = ['blue', 'red', 'green', 'yellow', 'orange', 'purple', 'violet', 'grey', 'gray', 'brown', 'beige', 'white', 'black', 'pink', 'turquoise'];
    const mainHue = hueKeywords.find(hue => color.name.toLowerCase().includes(hue)) || 'blue';

    const newColor = await getMockUpColorMoonshot(option, color, mainHue);
    
    console.log("Current color:", color);
    console.log("Extracted hue:", mainHue);

    return NextResponse.json({ 
      message: "success", 
      color: newColor,
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