import { createCommand, lambda } from "@/lib/aws/lambda";
import { prisma } from "@/lib/prisma";
import { setHueClawStatus } from "@/lib/redis";
import { AiQuoteSchema } from "@/lib/zod/hueclaw/quote-payload";
import { HueClawQuoteMetadata } from "@/lib/zod/hueclaw/quote/quote-metadata";



type PendingMessagePayload = {
  deliveryMethod: "SMS" | "EMAIL" | "NONE";
  msgBody: string | null;
  msgSubject: string | null;
};

export async function handleHueClawQuote(
  threadId: string,
  lockKey: string,
  pendingMessage: PendingMessagePayload,
  quoteData?: AiQuoteSchema
) {
  if (quoteData) {
    // processQuoteData — save + trigger comms
    return;
  }

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
          huelineId: true,
          roomType: true,
          dimensions: true,
          prompt: true,
        },
      },
    },
  });

  if (!thread) throw new Error("Thread not found");

  const booking = thread.bookingData?.[0];

  const systemTask = await prisma.systemTask.create({
    data: {
      type: "QUOTE_GENERATION",
      lockKey,
      customer: { connect: { id: thread.customerId } },
      subdomain: { connect: { id: thread.subdomainId } },
      deliveryMethod: pendingMessage.deliveryMethod,
      status: "PROCESSING",
      initiator: "HUECLAW",
      metadata: {
        threadId,
        pendingMessage,
        huelineId: booking?.huelineId || "",
        roomType: booking?.roomType || "UNKNOWN",
        squareFeet: Number(booking?.dimensions ?? 0),
        paintColors: booking?.paintColors || [],
        prompt: booking?.prompt || "",
      } satisfies HueClawQuoteMetadata
    },
  });

  const payload = {
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/hueclaw`,
    systemTaskId: systemTask.id,
    roomType: booking?.roomType || "UNKNOWN",
    squareFeet: booking?.dimensions || 0,
    colorNames: booking?.paintColors || [],
    prompt: booking?.prompt || "",
  };

  const command = createCommand({
    functionName: "hueline-hueclaw-quotegen-PROD",
    payload,
  });

  await setHueClawStatus(threadId, "QUOTE");
  await lambda.send(command);
}