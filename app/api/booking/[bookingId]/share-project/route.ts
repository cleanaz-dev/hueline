import { NextResponse } from "next/server";
interface Params {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { bookingId } = await params;
  try {
    const body = await req.json();
    console.log("bofy:", body,"Booking ID:", bookingId);
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
