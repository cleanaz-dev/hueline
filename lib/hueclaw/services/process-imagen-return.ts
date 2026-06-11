import { hueClawImagenMetadataSchema } from "@/lib/zod/imagen-metadata/hueclaw-imagen-metadata";
import { imagenResultPayloadSchema } from "@/lib/zod/hueclaw/imagen/imagen-result-payload";

export async function processImagenReturn(task: any, rawResult: any) {
  // 1. Unpack Metadata
  const metadata = hueClawImagenMetadataSchema.parse(task.metadata);
  const { threadId, pendingMessage } = metadata; 

  // 2. Validate Lambda Payload
  const result = imagenResultPayloadSchema.parse(rawResult);

  // 3. Execute Final Delivery (Merge Backpack + S3 URLs)
  console.log(`Sending ${pendingMessage.deliveryMethod} with image:`, result.s3Key);
  // await finalizeHueClawDelivery({ pendingMessage, images: result.s3Urls });

  // 4. Signal gateway to clean up
  return { releaseLock: true, threadId, message: "Imagen delivery complete" };
}