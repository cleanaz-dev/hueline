import {
  ClientActivityType,
  CommunicationRole,
  CommunicationType,
  Customer,
  Job,
  LogActor,
} from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createMockupBooking } from "@/lib/prisma/mutations/booking-data/create-mockup-booking";
import { voiceMockupWebhookBodySchema } from "@/lib/zod/voice-mockup-webhook-body";

export type MockupTriggerSource = "DEMO_VOICE_AGENT" | "STANDARD_VOICE_AGENT";

export interface MockupContext {
  colorBrand: string;
  colorName: string;
  colorCode: string;
  colorHex: string;
  roomType: string;
  callerName: string;
  callerPhone: string;
  huelineId: string;
  imageS3Key: string;
  imageSize: number;
  imageType: string;
}

interface MockupConfig {
  logActor: LogActor;
  role: CommunicationRole;
  logTitle: (ctx: MockupContext) => string;
  logDescription: (ctx: MockupContext) => string;
  activityType: ClientActivityType;
  activityTitle: (ctx: MockupContext) => string;
  activityDescription: (ctx: MockupContext) => string;
  communicationType: CommunicationType;
  communicationBody: (ctx: MockupContext) => string;
}

const MOCKUP_CONFIG: Record<MockupTriggerSource, MockupConfig> = {
  DEMO_VOICE_AGENT: {
    logActor: "CLIENT",
    role: "CLIENT",
    logTitle: () => "Client Generated Voice Mockup",
    logDescription: (ctx) =>
      `Mockup Colors - ${ctx.colorBrand} ${ctx.colorName} ${ctx.colorCode} for ${ctx.roomType}`,
    activityType: "GENERATED_IMAGE",
    activityTitle: () => "Client Generated Voice Mockup",
    activityDescription: (ctx) =>
      `${ctx.callerName} called and generated a Mockup - ${ctx.colorBrand} ${ctx.colorName} ${ctx.colorCode}`,
    communicationType: "SMS",
    communicationBody: (ctx) =>
      `Sent ${ctx.colorName} image + portal link + PIN`,
  },
  STANDARD_VOICE_AGENT: {
    logActor: "CLIENT",
    role: "CLIENT",
    logTitle: () => "Client Generated Voice Mockup",
    logDescription: (ctx) =>
      `Mockup Colors - ${ctx.colorBrand} ${ctx.colorName} ${ctx.colorCode} for ${ctx.roomType}`,
    activityType: "GENERATED_IMAGE",
    activityTitle: () => "Client Generated Voice Mockup",
    activityDescription: (ctx) =>
      `${ctx.callerName} called and generated a Mockup - ${ctx.colorBrand} ${ctx.colorName} ${ctx.colorCode}`,
    communicationType: "SMS",
    communicationBody: (ctx) =>
      `Sent ${ctx.colorName} image + portal link + PIN`,
  },
};

interface ProcessMockupArgs {
  webhookBody: unknown;
  triggerSource: MockupTriggerSource;
  job: Job;
  customer: Customer;
  operatorId?: string | null;
  operatorName?: string | null;
}

export async function processMockupWorkflow({
  webhookBody,
  triggerSource,
  job,
  customer,
  operatorId,
}: ProcessMockupArgs) {
  const config = MOCKUP_CONFIG[triggerSource];

  try {
    const parsedWebhook = voiceMockupWebhookBodySchema.safeParse(webhookBody);
    if (!parsedWebhook.success) {
      console.error("Webhook Validation Failed:", parsedWebhook.error.issues);
      throw new Error("Invalid webhook payload format");
    }

    const webhook = parsedWebhook.data;

    if (!job.huelineId) {
      throw new Error("Missing huelineId on job");
    }

    const subBookingData = await prisma.subBookingData.findUnique({
      where: { huelineId: job.huelineId },
      select: {
        roomType: true,
        subdomain: {
          select: { id: true, slug: true },
        },
      },
    });

    if (!subBookingData) {
      throw new Error(
        "SubBookingData not found for huelineId: " + job.huelineId,
      );
    }

    const context: MockupContext = {
      colorBrand: webhook.colorBrand,
      colorName: webhook.colorName,
      colorCode: webhook.colorCode,
      colorHex: webhook.colorHex,
      roomType: webhook.roomType,
      callerName: customer.name ?? "Unknown",
      callerPhone: customer.phone ?? "",
      huelineId: job.huelineId,
      imageS3Key: webhook.imageS3Key,
      imageSize: webhook.size ?? 0,
      imageType: "image/jpeg",
    };

    const smsBody = config.communicationBody(context);

    await createMockupBooking({
      huelineId: job.huelineId!,
      subdomainId: subBookingData.subdomain.id,
      slug: subBookingData.subdomain.slug,
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      roomType: webhook.roomType,
      prompt: webhook.prompt,
      originalImages: webhook.imageS3Key,
      mockupUrls: webhook.mockupUrls ?? [],
      colorBrand: webhook.colorBrand,
      colorName: webhook.colorName,
      colorCode: webhook.colorCode,
      colorHex: webhook.colorHex,
      summary: webhook.summary,
      callDuration: webhook.callDuration,
      dimensions: webhook.dimensions,
      dateTime: webhook.dateTime,
      pin: webhook.pin,
      callSid: webhook.callSid,
    });

    await prisma.$transaction(async (tx) => {
      // Communication + media attachment (the mockup image)
      await tx.clientCommunication.create({
        data: {
          body: smsBody,
          role: config.role,
          type: config.communicationType,
          customer: { connect: { id: customer.id } },
          ...(operatorId ? { operator: { connect: { id: operatorId } } } : {}),
          mediaAttachments: {
            create: {
              filename: `${webhook.colorBrand}-${webhook.colorName}-${webhook.colorCode}`, // toLowerCase()
              size: webhook.size ?? 0,
              mimeType: "image/jpeg",
              mediaSource: "S3",
              mediaUrl: webhook.imageS3Key,
            },
          },
        },
      });

      // Activity
      await tx.clientActivity.create({
        data: {
          type: config.activityType,
          title: config.activityTitle(context),
          description: config.activityDescription(context),
          metadata: { huelineId: job.huelineId, jobId: job.id },
          customer: { connect: { id: customer.id } },
        },
      });

      // System log
      await tx.logs.create({
        data: {
          title: config.logTitle(context),
          type: "MOCKUP",
          actor: config.logActor,
          description: config.logDescription(context),
          subdomain: { connect: { id: subBookingData.subdomain.id } },
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error(
      `[processMockupWorkflow] Failed for customer ${customer.id}:`,
      error,
    );
    throw new Error("Failed to process mockup workflow");
  }
}
