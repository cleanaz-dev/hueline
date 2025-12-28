//api/subdomain/[slug]/room/[roomId]/analyzy-chunk/route.ts
import { analyzeRoomTextMoonshot } from "@/lib/moonshot/services/analyze-room-text";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug, roomId } = await params;

  if (!slug || !roomId)
    return NextResponse.json({ message: "Invalid Parametes" }, { status: 400 });

  try {
    const { text } = await req.json();

    if (!text)
      return NextResponse.json({ message: "Missing Text" }, { status: 400 });

    const response = await analyzeRoomTextMoonshot(text);

    if (response) return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Validating Text" },
      { status: 500 }
    );
  }
}
