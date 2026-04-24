import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// Update this import path to point to where your NextAuth authOptions are defined
import { authOptions } from "@/lib/auth"; 
import twilio from "twilio";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function GET(request: Request) {
  try {
    // 1. Security Guard: Verify Session and SUPER_ADMIN role
    const session = await getServerSession(authOptions);

    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin access required." },
        { status: 401 }
      );
    }

    // 2. Extract query parameters
    const { searchParams } = new URL(request.url);
    const areaCode = searchParams.get("areaCode");
    const country = searchParams.get("country") || "US"; // Default to US, but allows CA

    // Validate area code
    if (!areaCode || areaCode.length < 3) {
      return NextResponse.json(
        { error: "Please provide a valid 3-digit area code." },
        { status: 400 }
      );
    }

    // 3. Search Twilio for available numbers
    // We request numbers that specifically support Voice and SMS
    const availableNumbers = await client
      .availablePhoneNumbers(country)
      .local.list({
        areaCode: Number(areaCode),
        limit: 5, // Keep it to top 5 so we don't overwhelm the UI
        voiceEnabled: true,
        smsEnabled: true, 
      });

    // 4. Format the output to be clean for the frontend
    const formattedNumbers = availableNumbers.map((num) => ({
      phoneNumber: num.phoneNumber,       // e.g., "+14165551234" (Used for the database/purchase)
      friendlyName: num.friendlyName,     // e.g., "(416) 555-1234" (Used for the UI display)
      locality: num.locality || "Local",  // e.g., "Toronto"
      region: num.region || "",           // e.g., "ON"
    }));

    return NextResponse.json({ numbers: formattedNumbers }, { status: 200 });

  } catch (error: any) {
    console.error("Twilio Search Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch available numbers." },
      { status: 500 }
    );
  }
}