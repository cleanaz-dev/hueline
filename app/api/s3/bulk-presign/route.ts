import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/aws/s3/services";

export async function POST(request: NextRequest) {
  try {
    const { keys } = await request.json();
    
    if (!keys || !Array.isArray(keys)) {
      return NextResponse.json({ error: "Missing keys array" }, { status: 400 });
    }

    // Generate URLs in parallel (takes ~1 millisecond per key, very fast)
    const signedUrls: Record<string, string> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        if (key && typeof key === 'string') {
          signedUrls[key] = await getPresignedUrl(key);
        }
      })
    );

    return NextResponse.json({ urls: signedUrls });
  } catch (error) {
    console.error("Bulk presign error:", error);
    return NextResponse.json({ error: "Failed to bulk presign URLs" }, { status: 500 });
  }
}