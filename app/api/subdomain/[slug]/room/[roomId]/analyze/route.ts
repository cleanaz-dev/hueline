// api/subdomain/[slug]/room/[roomId]/analyze/route.ts

import { NextResponse } from "next/server";
import { imageToText } from "@/lib/replicate";
import { speakRequest } from "@/lib/deepgram/services/speak-request";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string
  }>
}

export async function POST(req: Request, { params }: Params) {
  const { slug, roomId } = await params;
  
  if (!slug || !roomId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // 1. Get image from body
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 2. Vision: Get text from Image
    const textOutput = await imageToText(image);

    // 3. Voice: Get audio from Text
    const responseData = await speakRequest(textOutput);

    // 4. Return to client
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" }, 
      { status: 500 }
    );
  }
}