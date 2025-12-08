import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    bookingId: string;
  }>;
}

;

export async function POST(req: Request, { params }: Params) {
  
  try {
    console.log("✅ Process completed");

    return NextResponse.json(
      {
        message: "Access shared successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error sharing booking:", error);
    return NextResponse.json(
      { error: "Failed to share booking" },
      { status: 500 }
    );
  }
}
