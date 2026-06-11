import { prisma } from "@/lib/prisma";
import { handlerQuoteWebhookSchema } from "@/lib/zod/quotes/handler-quote-webhook-schema";
import { handleHueClawCommunication } from "@/lib/hueclaw/handlers/communication";
import { z } from "zod";

// Matches exactly what handleHueClawQuote stores in systemTask.metadata
const hueClawQuoteMetadataSchema = z.object({
  threadId: z.string(),
  pendingMessage: z.object({
    deliveryMethod: z.enum(["SMS", "EMAIL", "NONE"]),
    msgBody: z.string().nullable(),
    msgSubject: z.string().nullable(),
  }),
  huelineId: z.string(),
  roomType: z.string(),
  squareFeet: z.number(),
  paintColors: z.array(z.string()),
  prompt: z.string(),
});

export async function processQuoteReturn(task: any, rawResult: any) {
  // 1. Unpack the backpack that handleHueClawQuote packed
  const metadata = hueClawQuoteMetadataSchema.parse(task.metadata);
  const { threadId, pendingMessage } = metadata;

  // 2. Fetch customer
  const customer = await prisma.customer.findUnique({
    where: { id: task.customerId },
  });
  if (!customer) throw new Error(`Customer not found for task ${task.id}`);

  // 3. Validate Lambda result
  const validPayload = handlerQuoteWebhookSchema.parse(rawResult);

  // 4. Create Quote — no pre-generated quoteId in the HueClaw flow
  const quote = await prisma.quote.create({
    data: {
      customerId: customer.id,
      subdomainId: task.subdomainId,
      items: validPayload.items,
      totalAmount: validPayload.totalAmount,
      version: 1,
      ...(metadata.huelineId ? { huelineId: metadata.huelineId } : {}),
    },
  });

  // 5. DB side effects
  await prisma.$transaction(async (tx) => {
    await tx.clientCommunication.create({
      data: {
        body: "",
        role: "AI",
        type: "QUOTE",
        customer: { connect: { id: customer.id } },
        ...(task.operatorId ? { operator: { connect: { id: task.operatorId } } } : {}),
        chatThread: { connect: { id: threadId } },
        
      },
    });

    await tx.clientActivity.create({
      data: {
        type: "QUOTE_GENERATION",
        title: `Automated Quote Generated: $${validPayload.totalAmount.toFixed(2)}`,
        description: `An automated quote for ${validPayload.items.length} items was generated for ${customer.name ?? ""} (via ${task.deliveryMethod}).`,
        metadata: { huelineId: metadata.huelineId, jobId: task.id },
        customer: { connect: { id: customer.id } },
        subDomain: { connect: { id: task.subdomainId } },
        chatThread: { connect: { id: threadId } },
      },
    });

    await tx.logs.create({
      data: {
        title: `Automated Quote Generated for ${customer.name ?? ""}`,
        type: "QUOTE",
        actor: "SYSTEM",
        description: `An automated quote for ${validPayload.items.length} items totaling $${validPayload.totalAmount.toFixed(2)} was generated (via ${task.deliveryMethod}).`,
        subdomain: { connect: { id: task.subdomainId } },
      },
    });
  });

  // 6. Fire comms — same pattern as processNudgeReturn's direct comms route
  await handleHueClawCommunication({
    threadId,
    lockKey: task.lockKey,
    pendingMessage,
  });

  return {
    releaseLock: true,
    threadId,
    message: "Quote processed, saved, and HueClaw comms delivered.",
  };
}