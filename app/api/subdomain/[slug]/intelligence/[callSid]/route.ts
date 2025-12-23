import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; callSid: string }> }
) {
  const { slug, callSid } = await params;

  if (!slug || !callSid)
    return NextResponse.json(
      { message: "Missing Parameters" },
      { status: 400 }
    );
  // 1. SECURITY CHECK
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { intelligence, transcript_text, recording_url } = body;

    console.log(`💾 Saving Intelligence for Call: ${callSid}`);

    // 2. SAVE TO DATABASE
    // We update the specific Call record found by callSid
    const updatedCall = await prisma.call.update({
      where: { callSid: callSid },
      data: {
        audioUrl: recording_url,
        // Create or Update the related CallIntelligence record
        intelligence: {
          upsert: {
            create: {
              transcriptText: transcript_text,
              callReason: intelligence.callReason || "OTHER",
              projectScope: intelligence.projectScope,
              estimatedAdditionalValue:
                intelligence.estimatedAdditionalValue || 0,
              // Store all the extra custom fields (cabinet_fee, etc) in JSON
              customFields: intelligence,
            },
            update: {
              transcriptText: transcript_text,
              callReason: intelligence.callReason || "OTHER",
              projectScope: intelligence.projectScope,
              estimatedAdditionalValue:
                intelligence.estimatedAdditionalValue || 0,
              customFields: intelligence,
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, id: updatedCall.id });
  } catch (error) {
    console.error("❌ Error saving intelligence:", error);
    // Even if it fails, return 200 so Lambda doesn't retry infinitely
    return NextResponse.json({ error: "Failed to save" }, { status: 200 });
  }
}
