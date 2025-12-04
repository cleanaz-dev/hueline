// app/api/test/add-watermark/route.ts
import { NextResponse } from "next/server";
import { addWatermarkFromUrl } from "@/lib/utils/watermark";

const WATERMARK_URL = "https://res.cloudinary.com/dmllgn0t7/image/upload/v1760933379/new-watermark.png";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    
    // Add watermark
    const watermarkedBuffer = await addWatermarkFromUrl(
      imageUrl,
      WATERMARK_URL,
      {
        position: "center",
        scale: 1,
        margin: 0,
        opacity: 0.3
      }
    );
    
    // Return as base64
    const base64 = watermarkedBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    
    return NextResponse.json({ 
      success: true,
      imageUrl: dataUrl  // ✅ Just put this in an <img src="..." />
    });
    
  } catch (error) {
    console.error("Error adding watermark:", error);
    return NextResponse.json(
      { error: "Failed to add watermark" },
      { status: 500 }
    );
  }
}