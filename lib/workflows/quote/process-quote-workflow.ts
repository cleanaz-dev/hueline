import {
  ClientActivityType,
  CommunicationRole,
  Customer,
  LogActor,
  SystemTask,
} from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { invalidateThreadCache } from "@/lib/redis/agent-context";
import {
  HandlerQuoteWebhookBody,
  handlerQuoteWebhookSchema,
  quoteGenerationMetadataSchema,
} from "@/lib/zod/quotes/handler-quote-webhook-schema";
import z from "zod";

export type QuoteTriggerSource = z.infer<
  typeof handlerQuoteWebhookSchema
>["action"];

export interface QuoteContext {
  totalAmount: string;
  items: string;
  itemCount: string;
  recipientName: string;
  roomType: string;
  deliveryMethod: string;
  operatorName?: string;
  squareFootage?: string;
}

interface TriggerConfig {
  logActor: LogActor;
  role: CommunicationRole;
  logTitle: (ctx: QuoteContext) => string;
  logDescription: (ctx: QuoteContext) => string;
  activityType: ClientActivityType;
  activityTitle: (ctx: QuoteContext) => string;
  activityDescription: (ctx: QuoteContext) => string;
  markFirstFollowupComplete: boolean;
  getSmsBody: (ctx: QuoteContext) => string;
  getEmailSubject: (ctx: QuoteContext) => string;
  getEmailHtml: (ctx: QuoteContext) => string;
}

const TRIGGER_CONFIG: Record<QuoteTriggerSource, TriggerConfig> = {
  OPERATOR_QUOTE_GENERATION: {
    logActor: "PAINTER",
    role: "OPERATOR",
    logTitle: (ctx) => `Quote Generated for ${ctx.recipientName}`,
    logDescription: (ctx) =>
      `A quote for ${ctx.itemCount} items totaling $${ctx.totalAmount} was generated.`,
    activityType: "QUOTE_GENERATION",
    activityTitle: (ctx) => `Quote Generated: $${ctx.totalAmount}`,
    activityDescription: (ctx) =>
      `A quote for ${ctx.itemCount} items was generated for ${ctx.recipientName}.`,
    markFirstFollowupComplete: true,
    getSmsBody: (ctx) =>
      `Your quote for ${ctx.itemCount} items totaling $${ctx.totalAmount} is ready!`,
    getEmailSubject: (ctx) => `Your Quote is Ready - $${ctx.totalAmount}`,
    getEmailHtml: (ctx) =>
      `<p>Hi ${ctx.recipientName},</p><p>Your quote for ${ctx.itemCount} items totaling <strong>$${ctx.totalAmount}</strong> has been generated.</p><p>Thank you for choosing our service!</p>`,
  },
  AUTOMATED_QUOTE_GENERATION: {
    logActor: "SYSTEM",
    role: "AI",
    logTitle: (ctx) => `Automated Quote Generated for ${ctx.recipientName}`,
    logDescription: (ctx) =>
      `An automated quote for ${ctx.itemCount} items totaling $${ctx.totalAmount} was generated.`,
    activityType: "QUOTE_GENERATION",
    activityTitle: (ctx) => `Automated Quote Generated: $${ctx.totalAmount}`,
    activityDescription: (ctx) =>
      `An automated quote for ${ctx.itemCount} items was generated for ${ctx.recipientName}.`,
    markFirstFollowupComplete: false,
    getSmsBody: (ctx) =>
      `Your automated quote for ${ctx.itemCount} items totaling $${ctx.totalAmount} is ready!`,
    getEmailSubject: (ctx) =>
      `Your Automated Quote is Ready - $${ctx.totalAmount}`,
    getEmailHtml: (ctx) =>
      `<p>Hi ${ctx.recipientName},</p><p>Your automated quote for ${ctx.itemCount} items totaling <strong>$${ctx.totalAmount}</strong> has been generated.</p><p>Thank you for choosing our service!</p>`,
  },
};

interface TriggerConfig {
  logActor: LogActor;
  role: CommunicationRole;
  logTitle: (ctx: QuoteContext) => string;
  logDescription: (ctx: QuoteContext) => string;
  activityType: ClientActivityType;
  activityTitle: (ctx: QuoteContext) => string;
  activityDescription: (ctx: QuoteContext) => string;
  markFirstFollowupComplete: boolean;
  getSmsBody: (ctx: QuoteContext) => string;
  getEmailSubject: (ctx: QuoteContext) => string;
  getEmailHtml: (ctx: QuoteContext) => string;
}

export async function processQuoteWorkflow({
  webhookBody,
  triggerSource,
  job,
  customer,
}: {
  webhookBody: HandlerQuoteWebhookBody; // You can replace 'any' with a more specific type based on your payload structure
  triggerSource: QuoteTriggerSource;
  job: SystemTask;
  customer: Customer;
}) {
  // This is where you would implement the actual processing logic for the quote generation workflow.
  // For example, you might want to create or update a Quote record in your database based on the webhook payload.

  console.log("Processing Quote Workflow with body:", webhookBody);
  const config = TRIGGER_CONFIG[triggerSource];

  const subdomain = await prisma.subdomain.findUnique({
    where: { id: job.subdomainId },
    select: {
      id: true,
      slug: true,
      twilioPhoneNumber: true,
    },
  });

  if (!subdomain?.twilioPhoneNumber) {
    throw new Error(`Subdomain Data Invalid or missing Twilio phone number`);
  }

  const metadata = quoteGenerationMetadataSchema.parse(job.metadata);

  // Upsert Quote record based on webhook payload
  // Note: The actual fields will depend on your Quote model and the structure of the webhook payload
  const quote = await prisma.quote.upsert({
    where: {
      id: metadata.quoteId,
    },
    update: {
      items: webhookBody.items,
      totalAmount: webhookBody.totalAmount,
      version: { increment: 1 },
    },
    create: {
      id: metadata.quoteId,
      customerId: customer.id,
      subdomainId: job.subdomainId,
      items: webhookBody.items,
      ...(metadata.huelineId ? { huelineId: metadata.huelineId } : {}),
      totalAmount: webhookBody.totalAmount,
      version: 1,
    },
  });
  const context: QuoteContext = {
    deliveryMethod: "NONE",
    itemCount: String(webhookBody.items.length),
    items: JSON.stringify(webhookBody.items),
    totalAmount: webhookBody.totalAmount.toFixed(2),
    recipientName: customer.name ?? "",
    roomType: metadata.roomType,
    squareFootage: metadata.squareFeet
      ? String(metadata.squareFeet)
      : undefined,
  };

  // 5. Get Text/Email Content from Config
  const smsBody = config.getSmsBody(context);
  const emailSubject = config.getEmailSubject(context);
  const emailHtml = config.getEmailHtml(context);

  if (job.deliveryMethod === "SMS" && customer.phone) {
    // await twilioClient.messages.create({
    //   to: customer.phone,
    //   from: subdomain.twilioPhoneNumber,
    //   body: smsBody,
    //   mediaUrl: [presignedUrl],
    // });
    console.log("SMS Actions Here...");
  } else if (job.deliveryMethod === "EMAIL" && customer.email) {
    console.log("Email Actions Here....");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.clientCommunication.create({
        data: {
          body: "",
          role: config.role,
          type: "QUOTE",
          customer: { connect: { id: customer.id } },

          ...(job.operatorId
            ? { operator: { connect: { id: job.operatorId } } }
            : {}),
          chatThread: { connect: { id: metadata.chatThreadId } },
        },
      });

      await tx.clientActivity.create({
        data: {
          type: config.activityType,
          title: config.activityTitle(context),
          description: `${config.activityDescription(context)} (via ${job.deliveryMethod})`,
          metadata: { huelineId: "", jobId: job.id },
          customer: { connect: { id: customer.id } },
          subDomain: { connect: { id: job.subdomainId } },
          chatThread: { connect: { id: metadata.chatThreadId } },
        },
      });

      await tx.logs.create({
        data: {
          title: config.logTitle(context),
          type: "QUOTE",
          actor: config.logActor,
          description: `${config.logDescription(context)} (via ${job.deliveryMethod})`,
          subdomain: { connect: { id: subdomain.id } },
        },
      });

      return { success: true };
    });

    // Invalidate REDIS THREAD CACHE
    await invalidateThreadCache(subdomain.slug, metadata.chatThreadId!);
  } catch (error) {
    console.error(`[processQuoteWorkflow] Failed for ${customer.id}:`, error);
    throw new Error("Failed to process quote workflow");
  }
}
