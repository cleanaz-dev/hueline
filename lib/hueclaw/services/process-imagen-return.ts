import { hueClawImagenMetadataSchema } from "@/lib/zod/imagen-metadata/hueclaw-imagen-metadata";
import { hueClawImagenResultPayloadSchema } from "@/lib/zod/hueclaw/imagen/imagen-result-payload";
import { handleHueClawImagenReturn } from "../handlers/handle-hueclaw-imagen-return";
import { finalizeHueClawDelivery } from "../finalize-hueclaw-delivery";
import { SystemTask } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { paintColorMsgGenerator } from "./paint-color-message-generator"; 

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

  if (!rawResult) {
    throw new Error(
      "Imagen Lambda returned an empty result payload. Check the Lambda logs to see why the AI failed."
    );
  }

  // 2. Validate Lambda Payload
  const result = hueClawImagenResultPayloadSchema.parse(rawResult);

  const customer = await prisma.customer.findUnique({
    where: { id: task.customerId! },
  });

  if (!customer) {
    throw new Error(`Customer not found for ID: ${task.customerId}`);
  }

  const subdomain = await prisma.subdomain.findUnique({
    where: { id: customer.subdomainId! },
    select: { slug: true },
  });

  // 3. Update customer information with image and point colors
  await handleHueClawImagenReturn(result, metadata, task);

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
    hex: result.selectedColorHex, 
  };

  // 4. GENERATE THE CONTEXT-AWARE MESSAGE 
  const draftMsgBody = pendingMessage.msgBody ?? "Here is your new room mockup!";
  
  const finalMsgBody = await paintColorMsgGenerator(
    draftMsgBody,
    {
      brand: result.selectedColorBrand,
      name: result.selectedColorName,
      code: result.selectedColorCode,
    },
    pendingMessage.deliveryMethod,
    portalLink // 👈 Passed to the AI so it weaves it into finalMsgBody
  );

  // 5. Execute Final Delivery 
  await finalizeHueClawDelivery({
    pendingMessage: {
      ...pendingMessage,
      msgBody: finalMsgBody, // 👈 Beautiful, AI-formatted text with the link embedded!
    },
    images: result.newImagenS3Key,
    customer,
    threadId, // 👈 portalLink removed from here!
    newImagenKey: result.newImagenS3Key,
    newImagenCompressedKey: result.compressedS3Key,
    color,
  });

  // 6. Signal gateway to clean up
  return { releaseLock: true, threadId, message: "Imagen delivery complete" };
}