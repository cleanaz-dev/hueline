import { generateAltMockup } from "@/lib/replicate";
import { updateBookingWithAltMockup } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Need to await the JSON parsing
    const data = await req.json();

    const { phoneNumber, prompt, imageUrl, removeFurniture = false } = data;
    console.log("Data:", data);
    // return NextResponse.json({ message: "Data Received " }, { status: 200 });
    // Validate required fields
    if (!prompt || !imageUrl || !phoneNumber) {
      return NextResponse.json(
        {
          message: "Missing required fields: prompt, imageUrl, and phoneNumber",
        },
        { status: 400 }
      );
    }

    // Ensure imageUrl is an array (replicate expects array)
    const imageArray = Array.isArray(imageUrl) ? imageUrl : [imageUrl];

    // Generate the mockup and wait for result
    const altMockupUrl = await generateAltMockup(prompt, imageArray, removeFurniture);

    // Update the booking data with the new alternate mockup
    const updatedBooking = await updateBookingWithAltMockup(
      phoneNumber,
      altMockupUrl
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { message: "Booking not found for this phone number" },
        { status: 404 }
      );
    }

    console.log("Generated and saved alt mockup URL:", altMockupUrl);

    return NextResponse.json(
      {
        message: "Alternative mockup generated successfully",
        altMockupUrl: altMockupUrl,
        updatedBooking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error },
      { status: 500 }
    );
  }
}
