// lib/services/image-compressor.ts
import { lambda, createCommand } from "@/lib/aws/lambda";
import { uploadImageAsset } from "@/lib/aws/s3";
import { NextResponse } from "next/server"; // <-- IMPORT ADDED

export interface ProcessedMedia {
  originalKey: string;
  compressedKey: string | null;
  filename: string;
  mimeType: string;
  size: number;
}

export async function processMediaUrl(
  mediaUrl: string,
  subdomainId: string,
  customerId: string
): Promise<ProcessedMedia | NextResponse> { // <-- TYPE UPDATED to allow NextResponse
  try {
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch media: ${response.statusText}` },
        { status: response.status }
      );
    }

    const file = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "image/jpeg";

    // Extract a sensible filename from the URL (fallback to a generated one)
    const urlPath = new URL(mediaUrl).pathname;
    const filename =
      decodeURIComponent(urlPath.split("/").pop() || "") ||
      `media-${Date.now()}.jpg`;

    const originalKey = await uploadImageAsset(
      file,
      `subdomains/${subdomainId}`,
      contentType,
      customerId
    );

    const command = createCommand({
      functionName: "hueline-compress-image-presigned-url-PROD",
      payload: { key: originalKey },
      invocationType: "RequestResponse", // Synchronous
    });

    const resp = await lambda.send(command);

    // 1. Check if the Lambda function ITSELF crashed (e.g. Python syntax error, timeout)
    if (resp.FunctionError) {
      const errorPayload = resp.Payload
        ? Buffer.from(resp.Payload).toString()
        : "Unknown Lambda runtime error";
      console.error("[ImageCompressor] Lambda execution failed:", errorPayload);
      
      return NextResponse.json(
        { error: "Lambda execution failed during image compression." },
        { status: 500 }
      );
    }

    // 2. Parse the successful Lambda response payload
    const result = resp.Payload
      ? JSON.parse(Buffer.from(resp.Payload).toString())
      : null;

    // 3. Check if the Python script handled an error and manually returned a 400/500
    if (!result || result.statusCode !== 200) {
      console.error("[ImageCompressor] Lambda returned an error status:", result);
      
      // Parse Python's error body if it exists (e.g., {'body': '{"error": "Processing failed"}'})
      let errorMessage = "Lambda returned no payload or failed";
      if (result?.body) {
        try {
          errorMessage = JSON.parse(result.body).error || errorMessage;
        } catch (e) {
          errorMessage = result.body; // Fallback if the body isn't JSON
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: result?.statusCode || 500 }
      );
    }

    // 4. Success!
    return {
      originalKey,
      compressedKey: result.key ?? null,
      filename,
      mimeType: contentType,
      size: file.length,
    };
  } catch (error) {
    console.error(`[ImageCompressor] Failed to process image`, error);
    // 5. Catch any unhandled Node.js crashes (e.g. AWS connection dropped)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}