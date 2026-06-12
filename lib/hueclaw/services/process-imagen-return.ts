import { hueClawImagenMetadataSchema } from "@/lib/zod/imagen-metadata/hueclaw-imagen-metadata";
import { hueClawImagenResultPayloadSchema } from "@/lib/zod/hueclaw/imagen/imagen-result-payload";

export async function processImagenReturn(task: any, rawResult: any) {
  // 1. Unpack Metadata
  const metadata = hueClawImagenMetadataSchema.parse(task.metadata);
  const { threadId, pendingMessage, huelineId, imageS3Key, removeFurniture, roomType } = metadata; 

  // 2. Validate Lambda Payload
  const result = hueClawImagenResultPayloadSchema.parse(rawResult);

  // 3. Update customer information with image and point colors
  // await handleHueClawImagenReturn({ result, metadata })

  // 4. Execute Final Delivery (Merge Backpack + S3 URLs)
  console.log(`Sending ${pendingMessage.deliveryMethod} with image:`, result.newImagenS3Key);
  // await finalizeHueClawDelivery({ pendingMessage, images: result.newImagenS3Key });

  // 5. Signal gateway to clean up
  return { releaseLock: true, threadId, message: "Imagen delivery complete" };
}