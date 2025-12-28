import { getRoomScope } from "@/lib/redis";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug, roomId } = await params;

    if (!slug || !roomId)
      return NextResponse.json(
        { message: "Invalid Parameters" },
        { status: 400 }
      );

    const scopeData = await getRoomScope(roomId);

    if (!scopeData)
      return NextResponse.json({ message: "No Scope Data" }, { status: 404 });

    return NextResponse.json({ scopeData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Retrieving Scope" },
      { status: 500 }
    );
  }
}