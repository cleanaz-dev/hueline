// lib/services/image-compressor.ts
import { lambda, createCommand } from "@/lib/aws/lambda";
import { uploadImageAsset } from "@/lib/aws/s3";

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
): Promise<ProcessedMedia | null> {
  try {
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status}`);
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
    });

    const resp = await lambda.send(command);
    const result = resp.Payload
      ? JSON.parse(Buffer.from(resp.Payload).toString())
      : null;

    if (!result || result.statusCode !== 200) {
      throw new Error("Lambda returned no payload or failed");
    }

    return {
      originalKey,
      compressedKey: result.key ?? null,
      filename,
      mimeType: contentType,
      size: file.length,
    };
  } catch (error) {
    console.error(`[ImageCompressor] Failed to process image`, error);
    return null;
  }
}

