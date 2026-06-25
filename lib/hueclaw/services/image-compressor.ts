// lib/services/image-compressor.ts
import { lambda, createCommand } from "@/lib/aws/lambda";
import { uploadImageAsset } from "@/lib/aws/s3";

export async function processMediaUrl(
  mediaUrl: string,
  subdomainId: string,
  customerId: string
) {
  try {
    // Buffer handled here, component stays clean
    const response = await fetch(mediaUrl);
    const file = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "image/jpeg";

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
    };
  } catch (error) {
    console.error(`[ImageCompressor] Failed to process image`, error);
    return { originalKey: null, compressedKey: null };
  }
}