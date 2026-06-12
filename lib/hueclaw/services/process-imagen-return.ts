import { hueClawImagenMetadataSchema } from "@/lib/zod/imagen-metadata/hueclaw-imagen-metadata";
import { hueClawImagenResultPayloadSchema } from "@/lib/zod/hueclaw/imagen/imagen-result-payload";
import { handleHueClawImagenReturn } from "../handlers/handle-hueclaw-imagen-return";
import { finalizeHueClawDelivery } from "../finalize-hueclaw-delivery";
import { SystemTask } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function processImagenReturn(task: SystemTask, rawResult: any) {
  // 1. Unpack Metadata
  const metadata = hueClawImagenMetadataSchema.parse(task.metadata);
  const {
    threadId,
    pendingMessage,
    huelineId,
    imageS3Key,
    removeFurniture,
    roomType,
  } = metadata;

  // 2. Validate Lambda Payload
  const result = hueClawImagenResultPayloadSchema.parse(rawResult);

  const customer = await prisma.customer.findUnique({
    where: {
      id: task.customerId!,
    },
  });

  const subdomain = await prisma.subdomain.findUnique({
    where: {
      id: task.subdomainId,
    },
    select: {
      slug: true,
    },
  });

  // 3. Update customer information with image and point colors
  await handleHueClawImagenReturn(result, metadata, task);

  // 4. Execute Final Delivery (Merge Backpack + S3 URLs)
  console.log(
    `Sending ${pendingMessage.deliveryMethod} with image:`,
    result.newImagenS3Key,
  );
  let portalLink: string | null = null;
  if (subdomain?.slug) {
    portalLink = `https://${subdomain.slug}.hue-line.com/j/${metadata.huelineId}`;
    
  }
  const color = {
    brand: result.selectedColorBrand,
    name: result.selectedColorName,
    code: result.selectedColorCode,
    hex: result.selectedColorHex
  }

  await finalizeHueClawDelivery({
    pendingMessage,
    images: result.newImagenS3Key,
    customer,
    portalLink,
    threadId,
    newImagenCompressedKey: result.compressedS3Key,
    color
  });

  // 5. Signal gateway to clean up
  return { releaseLock: true, threadId, message: "Imagen delivery complete" };
}
