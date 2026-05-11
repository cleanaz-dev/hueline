import {
  ClientActivityType,
  CommunicationRole,
  CommunicationType,
  Customer,
  Job,
  LogActor,
} from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { twilioClient } from "@/lib/twilio/config";
import { upscaleMetadata } from "@/lib/zod/job-upscale-metadata";
import { upscaleWebhookBodySchema } from "@/lib/zod/upscale-webhook-body";

export type UpscaleTriggerSource = "CLIENT_UPSCALE" | "OPERATOR_UPSCALE";

export interface UpscaleContext {
  resolution: string;
  imageCount: number;
  roomType: string;
  recipientName: string;
  portalLink: string;
  operatorName?: string;
}

interface UpscaleConfig {
  logActor: LogActor;
  role: CommunicationRole;
  logTitle: (ctx: UpscaleContext) => string;
  logDescription: (ctx: UpscaleContext) => string;
  activityType: ClientActivityType;
  activityTitle: (ctx: UpscaleContext) => string;
  activityDescription: (ctx: UpscaleContext) => string;
  getSmsBody: (ctx: UpscaleContext) => string;
}

const UPSCALE_CONFIG: Record<UpscaleTriggerSource, UpscaleConfig> = {
  CLIENT_UPSCALE: {
    logActor: "CLIENT",
    role: "CLIENT",
    logTitle: (ctx) => `Client Image Upscale ${ctx.resolution}`,
    logDescription: (ctx) =>
      `Image Upscale - ${ctx.resolution}. Total: ${ctx.imageCount}`,
    activityType: "UPSCALED_IMAGE",
    activityTitle: (ctx) => `Image Upscale - ${ctx.resolution}`,
    activityDescription: (ctx) =>
      `${ctx.recipientName} upscaled a ${ctx.resolution} image for ${ctx.roomType}. Total: ${ctx.imageCount}`,
    getSmsBody: (ctx) =>
      `Hi ${ctx.recipientName}! Your ${ctx.resolution} images are ready! ${ctx.portalLink}`,
  },
  OPERATOR_UPSCALE: {
    logActor: "PAINTER",
    role: "OPERATOR",
    logTitle: (ctx) => `Operator Image Upscale ${ctx.resolution}`,
    logDescription: (ctx) =>
      `Operator Image Upscale - ${ctx.resolution}. Total: ${ctx.imageCount}`,
    activityType: "UPSCALED_IMAGE",
    activityTitle: (ctx) =>
      `Operator Upscaled ${ctx.imageCount} ${ctx.resolution} image(s)`,
    activityDescription: (ctx) =>
      `Operator ${ctx.operatorName} Upscaled ${ctx.imageCount} ${ctx.resolution} image(s)`,
    getSmsBody: (ctx) =>
      `Hi ${ctx.recipientName}! Your ${ctx.resolution} images are ready! ${ctx.portalLink}`,
  },
};

interface UpscaleWebhookBody {
  status: string;
  s3Key: string;
  completedAt: string;
  action: UpscaleTriggerSource;
  size?: number; // Optional fallback if you add it to Python
}

interface ProcessUpscaleArgs {
  webhookBody: UpscaleWebhookBody;
  triggerSource: UpscaleTriggerSource;
  job: Job;
  customer: Customer;
  operatorId?: string | null;
  operatorName?: string | null;
}

export async function processUpscaleWorkflow({
  webhookBody,
  triggerSource,
  job,
  customer,
  operatorId,
  operatorName,
}: ProcessUpscaleArgs) {
  const config = UPSCALE_CONFIG[triggerSource];

  try {
    const parsedWebhook = upscaleWebhookBodySchema.safeParse(webhookBody);
    if (!parsedWebhook.success) {
      console.error("Webhook Validation Failed:", parsedWebhook.error.format());
      throw new Error("Invalid webhook payload format");
    }
    if (job.metadataSource !== "UPSCALE" || !job.metadata) {
      throw new Error(
        `Job ${job.id} has unexpected metadata source: ${job.metadataSource}`,
      );
    }

    const result = upscaleMetadata.safeParse(job.metadata);
    if (!result.success) {
      throw new Error(`Invalid upscale metadata on job ${job.id}`);
    }
    const metadata = result.data;

    const resolution = metadata.resolution;
    const imageCount = metadata.imageCount;
    const roomType = metadata.roomType;
    const recipientName = customer.name || "There";
    const huelineId = job.huelineId;

    if (!job.huelineId) {
      throw new Error("Missing huelineId");
    }

    // Determine strict delivery method
    const deliveryMethod = job.deliveryMethod as CommunicationType;
    if (!deliveryMethod) {
      throw new Error("Invalid Communication Type");
    }

    const subBookingData = await prisma.subBookingData.findUnique({
      where: { huelineId: job.huelineId },
      select: {
        subdomain: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    if (!subBookingData) {
      throw new Error("Booking data does not exist");
    }

    // Update Export record
    await prisma.export.update({
      where: { id: metadata.exportId },
      data: {
        resolution,
        imageCount,
        jobId: job.id,
        status: "COMPLETED",
        // Note: Assuming your Export schema uses `downloadUrl` to store the S3 Key
        // to be resolved into a presigned URL on the frontend later.
        downloadUrl: webhookBody.s3Key,
        completedAt: new Date(webhookBody.completedAt || new Date()),
      },
    });

    const portalLink = `https://${subBookingData.subdomain.slug}.hue-line.com/j/${huelineId}/downloads`;

    const context: UpscaleContext = {
      imageCount,
      resolution,
      operatorName: operatorName || "Painter User",
      recipientName: customer.name || "There",
      roomType,
      portalLink,
    };

    const smsBody = config.getSmsBody(context);

    // 5. Send SMS if applicable
    if (deliveryMethod === "SMS" && customer.phone) {
      await twilioClient.messages.create({
        to: customer.phone,
        from: metadata.twilioFromNumber,
        body: smsBody,
      });
    }

    // 6. Database Transaction (Logs & Activity)
    await prisma.$transaction(async (tx) => {
      // A. Communication Record
      await tx.clientCommunication.create({
        data: {
          body: smsBody, // Saving the actual message sent
          role: config.role,
          type: deliveryMethod,
          customer: { connect: { id: customer.id } },
          ...(operatorId ? { operator: { connect: { id: operatorId } } } : {}),
          mediaAttachments: {
            create: {
              filename: `upscale-${huelineId}-${resolution}.zip`, // Dynamic ZIP filename
              size: webhookBody.size || 0, // Fallback to 0 if size isn't provided
              mimeType: "application/zip", // Standard MIME type for ZIPs
              mediaSource: "S3",
              mediaUrl: webhookBody.s3Key, // Storing S3 Key instead of a temporary URL
            },
          },
        },
      });

      // B. Activity Log
      await tx.clientActivity.create({
        data: {
          type: config.activityType,
          title: config.activityTitle(context),
          description: `${config.activityDescription(context)} (via ${deliveryMethod})`,
          metadata: { huelineId, jobId: job.id },
          customer: { connect: { id: customer.id } },
        },
      });

      // C. System Log
      await tx.logs.create({
        data: {
          title: config.logTitle(context),
          type: "UPSCALE",
          actor: config.logActor,
          description: `${config.logDescription(context)} (via ${deliveryMethod})`,
          subdomain: { connect: { id: subBookingData.subdomain.id } },
        },
      });
    }); // <- Added missing closing brackets here

    return { success: true };
  } catch (error) {
    console.error(
      `[processUpscaleWorkflow] Failed for ${customer.id}:`,
      error,
    ); // Fixed error label
    throw new Error("Failed to process Upscale workflow");
  }
}
