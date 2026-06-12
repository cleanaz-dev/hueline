// Inside handleHueClawImagen.ts (Next.js Side)

import { createCommand, lambda } from "@/lib/aws/lambda";
import { prisma } from "@/lib/prisma";
import { setHueClawStatus } from "@/lib/redis";
import { HueClawImageMetadata } from "@/lib/zod/imagen-metadata/hueclaw-imagen-metadata";

// 1. Define the exact shape of the backpack
export type PendingMessagePayload = {
  deliveryMethod: "SMS" | "EMAIL" | "NONE";
  msgBody: string  | null 
  msgSubject: string | null
};

export async function handleHueClawImagen(
  threadId: string, 
  lockKey: string, 
  pendingMessage: PendingMessagePayload // <-- Strongly typed!
) {
  // 1. Fetch the entire thread
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { 
      communications: true, 
      customer: true, 
      subdomain: true, 
      bookingData: {
        select: {
            id: true,
            paintColors: true,
            originalImages: true,
            huelineId: true,
            roomType: true
        }
      }
    }
  });

  if (!thread) throw new Error("Thread not found");

  let originalImage: string = ""; // Default to empty string instead of null if S3 key expects string
  if (thread.bookingData?.[0]?.originalImages) {
    // Assuming originalImages might be an array or a direct string, adjust as needed
    originalImage = thread.bookingData[0].originalImages[0] || thread.bookingData[0].originalImages;
  }

  // 3. Create the new SystemTask for the Specialist
  const systemTask = await prisma.systemTask.create({
    data: {
      type: "IMAGEN",
      lockKey,
      customer: { connect: { id: thread.customerId } },
      subdomain: { connect: { id: thread.subdomainId } },
      deliveryMethod: pendingMessage.deliveryMethod, // <-- Fixed: Pulled from the backpack
      status: "PROCESSING",
      initiator: "HUECLAW",
      metadata: { 
        threadId,
        pendingMessage, // 🎒 <-- Fixed: Actually pack the backpack into the DB!
        imageS3Key: originalImage,
        removeFurniture: false,
        huelineId: thread.bookingData?.[0]?.huelineId || "",
        roomType: thread.bookingData?.[0]?.roomType || "UNKNOWN"
     } satisfies HueClawImageMetadata
    }
  });

  // 4. Send the ENTIRE context to the Imagen Lambda
  const payload = {
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/hueclaw`,
    systemTaskId: systemTask.id,
    threadHistory: thread.communications, 
    originalImageUrl: originalImage,
    subdomainId: thread.subdomainId // So the Lambda can fetch custom colors!
  };

  const command = createCommand({
    functionName: "hueline-hueclaw-imagen-PROD",
    payload
  });

  await setHueClawStatus(threadId, "IMAGEN");

  await lambda.send(command);
}