import { getRandomColor } from "@/lib/utils";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    bookingId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { bookingId } = await params;
  try {
    const color = getRandomColor()
    console.log("Color:", color, "BookingID:", bookingId)
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
