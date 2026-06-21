import { prisma } from "@/lib/prisma";
import { twilioClient } from "@/lib/twilio/config";
import { getPresignedUrl } from "@/lib/aws/s3";
import {
  CommunicationRole,
  ClientActivityType,
  LogActor,
  SystemTask,
  CommunicationType,
  Customer,
} from "@/app/generated/prisma";
import { sendEmail, SendMockUpEmail } from "@/lib/resend";
import {
  DesignImagenLambdaIngestBody,
  designImagenLambdaIngestSchema,
} from "@/lib/zod/design-imagen-body-schema";
import z from "zod";
import { DesignStudioMetadata, designStudioMetadataSchema } from "@/lib/zod/design-studio-metadata";
import { createNewSubBooking } from "./mutations/create-new-subbooking";
import { StandardImageMetadata, standardImagenMetadataSchema } from "@/lib/zod/imagen-metadata/standard-imagen-metadata-schema";
import { invalidateThreadCache } from "@/lib/redis/agent-context";

// ─── Trigger Source ───────────────────────────────────────────────────────────
export type ImagenTriggerSource = z.infer<
  typeof designImagenLambdaIngestSchema
>["action"];

// ─── Dynamic Context ──────────────────────────────────────────────────────────
export interface ImagenContext {
  colorBrand: string;
  colorName: string;
  colorHex: string;
  colorCode: string;
  recipientName: string;
  roomType: string;
  portalLink: string;
  removeFurniture?: boolean;
  pin?: string;
}

// ─── Trigger Config ───────────────────────────────────────────────────────────
interface TriggerConfig {
  logActor: LogActor;
  role: CommunicationRole;
  logTitle: (ctx: ImagenContext) => string;
  logDescription: (ctx: ImagenContext) => string;
  activityType: ClientActivityType;
  activityTitle: (ctx: ImagenContext) => string;
  activityDescription: (ctx: ImagenContext) => string;
  markFirstFollowupComplete: boolean;
  getSmsBody: (ctx: ImagenContext) => string;
  getEmailSubject: (ctx: ImagenContext) => string;
  getEmailHtml: (ctx: ImagenContext) => string;
}

const TRIGGER_CONFIG: Record<ImagenTriggerSource, TriggerConfig> = {
  CLIENT_IMAGEN: {
    logActor: "CLIENT",
    role: "CLIENT",
    logTitle: (ctx) => `Client Imagen — ${ctx.colorBrand} ${ctx.colorName}`,
    logDescription: (ctx) =>
      `${ctx.recipientName} generated a ${ctx.roomType} preview using ${ctx.colorBrand} ${ctx.colorName}.`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `${ctx.recipientName} generated ${ctx.colorBrand} ${ctx.colorName} on their ${ctx.roomType}`,
    markFirstFollowupComplete: false,
    getSmsBody: (ctx) =>
      `Your requested mockup featuring ${ctx.colorBrand} in ${ctx.colorName} is ready! View your portal here: ${ctx.portalLink}`,
    getEmailSubject: (ctx) => `Your New Room Mockup - ${ctx.colorName}`,
    getEmailHtml: (ctx) =>
      `<p>Your requested mockup featuring ${ctx.colorBrand} in ${ctx.colorName} is ready!</p><p><a href="${ctx.portalLink}">View your portal here</a></p>`,
  },
  FOLLOWUP_IMAGEN: {
    logActor: "SYSTEM",
    role: "OPERATOR",
    logTitle: (ctx) => `Followup Imagen — ${ctx.colorBrand} ${ctx.colorName}`,
    logDescription: (ctx) =>
      `System sent automated followup for ${ctx.recipientName} — ${ctx.colorBrand} ${ctx.colorName}.`,
    activityType: "FOLLOWUP_IMAGE_SENT",
    activityTitle: (ctx) => `Followup Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `Automated followup imagen sent to ${ctx.recipientName} using ${ctx.colorBrand} ${ctx.colorName}`,
    markFirstFollowupComplete: true,
    getSmsBody: (ctx) =>
      `Hey! It's been 24 hours since you tested our demo! Based on the colors you tried earlier, our AI design assistant thought ${ctx.colorBrand} ${ctx.colorName} (${ctx.colorCode}) would look incredible in your space. What do you think?\n\nView your new mockup here: ${ctx.portalLink}`,
    getEmailSubject: (ctx) => `Your AI Room Preview - ${ctx.colorName}`,
    getEmailHtml: (ctx) =>
      `<p>Hey! It's been 24 hours since you tested our demo! Based on the colors you tried earlier, our AI design assistant thought ${ctx.colorBrand} ${ctx.colorName} (${ctx.colorCode}) would look incredible in your space. What do you think?</p><p><a href="${ctx.portalLink}">View your new mockup here</a></p>`,
  },
  OPERATOR_IMAGEN: {
    logActor: "PAINTER",
    role: "OPERATOR",
    logTitle: (ctx) => `Operator Imagen — ${ctx.colorBrand} ${ctx.colorName}`,
    logDescription: (ctx) =>
      `Operator generated a ${ctx.roomType} preview for ${ctx.recipientName} using ${ctx.colorBrand} ${ctx.colorName}.`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `Operator Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `Operator sent ${ctx.recipientName} a ${ctx.roomType} preview — ${ctx.colorBrand} ${ctx.colorName}`,
    markFirstFollowupComplete: false,
    getSmsBody: (ctx) =>
      `Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}! View your portal here: ${ctx.portalLink}`,
    getEmailSubject: (ctx) => `New Room Mockup - ${ctx.colorName}`,
    getEmailHtml: (ctx) =>
      `<p>Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}!</p><p><a href="${ctx.portalLink}">View your portal here</a></p>`,
  },
  AI_IMAGEN: {
    logActor: "AI",
    role: "AI",
    logTitle: (ctx) => `AI Imagen — ${ctx.colorBrand} ${ctx.colorName}`,
    logDescription: (ctx) =>
      `AI generated a ${ctx.roomType} preview for ${ctx.recipientName} using ${ctx.colorBrand} ${ctx.colorName}.`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `AI Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `AI sent ${ctx.recipientName} a ${ctx.roomType} preview — ${ctx.colorBrand} ${ctx.colorName}`,
    markFirstFollowupComplete: false,
    getSmsBody: (ctx) =>
      `Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}! View your portal here: ${ctx.portalLink}`,
    getEmailSubject: (ctx) => `New Room Mockup - ${ctx.colorName}`,
    getEmailHtml: (ctx) =>
      `<p>Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}!</p><p><a href="${ctx.portalLink}">View your portal here</a></p>`,
  },
  EXISTING_DESIGN_STUDIO_IMAGEN: {
    logActor: "AI",
    role: "AI",
    logTitle: (ctx) => `AI Imagen — ${ctx.colorBrand} ${ctx.colorName}`,
    logDescription: (ctx) =>
      `AI generated a ${ctx.roomType} preview for ${ctx.recipientName} using ${ctx.colorBrand} ${ctx.colorName}.`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `AI Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `AI sent ${ctx.recipientName} a ${ctx.roomType} preview — ${ctx.colorBrand} ${ctx.colorName}`,
    markFirstFollowupComplete: false,
    getSmsBody: (ctx) =>
      `Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}! View your portal here: ${ctx.portalLink}`,
    getEmailSubject: (ctx) => `New Room Mockup - ${ctx.colorName}`,
    getEmailHtml: (ctx) =>
      `<p>Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}!</p><p><a href="${ctx.portalLink}">View your portal here</a></p>`,
  },
  NEW_DESIGN_STUDIO_IMAGEN: {
    logActor: "AI",
    role: "AI",
    logTitle: (ctx) => `AI Imagen — ${ctx.colorBrand} ${ctx.colorName}`,
    logDescription: (ctx) =>
      `AI generated a ${ctx.roomType} preview for ${ctx.recipientName} using ${ctx.colorBrand} ${ctx.colorName}.`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `AI Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `AI sent ${ctx.recipientName} a ${ctx.roomType} preview — ${ctx.colorBrand} ${ctx.colorName}`,
    markFirstFollowupComplete: false,
    getSmsBody: (ctx) =>
      `Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}! View your portal here: ${ctx.portalLink}${ctx.pin ? `\n\nYour secure PIN to access the portal is: ${ctx.pin}` : ""}`,
    getEmailSubject: (ctx) => `New Room Mockup - ${ctx.colorName}`,
    getEmailHtml: (ctx) =>
      `<p>Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}!</p><p><a href="${ctx.portalLink}">View your portal here</a></p>${ctx.pin ? `<p>Your secure PIN to access the portal is: <strong>${ctx.pin}</strong></p>` : ""}`,
  },
};

// ─── Main Function ────────────────────────────────────────────────────────────

interface ProcessImagenArgs {
  webhookBody: DesignImagenLambdaIngestBody;
  triggerSource: ImagenTriggerSource;
  job: SystemTask;
  customer: Customer;
  operatorId?: string | null;
}

export async function processImagenWorkflow({
  webhookBody,
  triggerSource,
  job,
  customer,
}: ProcessImagenArgs) {
  const config = TRIGGER_CONFIG[triggerSource];

  try {
    // 1. Parse ONLY the unstructured metadata using specific Zod schemas
    const isNewDesignStudio = triggerSource === "NEW_DESIGN_STUDIO_IMAGEN";
    
    // NOTE: You should export actual Zod schemas for these from your metadata schema files.
    // e.g., `designStudioMetadataSchema` and `standardImageMetadataSchema`.
    // We avoid `as Type` assertions so Zod can actually throw if data is malformed.
    const metadata = isNewDesignStudio
      ? designStudioMetadataSchema.parse(job.metadata) 
      : standardImagenMetadataSchema.parse(job.metadata);

    // 2. Validate Subdomain
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

    // 3. Database Save & Hueline ID Assignment
    let activeHuelineId: string;
    let generatedPin: string | undefined = undefined;

    if (isNewDesignStudio) {
      // It's a new design studio; we know we must generate a new sub-booking
      const subBookingData = await createNewSubBooking({
        colorBrand: metadata.brand,
        colorName: metadata.name,
        colorCode: metadata.code,
        colorHex: metadata.hex,
        roomType: metadata.roomType,
        originalImageS3Key: metadata.imageS3Key,
        newImagenS3Key: webhookBody.newImagenS3Key,
        customerId: customer.id,
        customerName: customer.name || "Customer",
        customerPhone: customer.phone || "",
        subdomainId: job.subdomainId,
        designId: (metadata as DesignStudioMetadata).designProjectId, 
      });
      
      activeHuelineId = subBookingData.huelineId;
      generatedPin = subBookingData.pin;
    } else {
      // It's standard; standardImageMetadataSchema ensures huelineId exists
      activeHuelineId = (metadata as StandardImageMetadata).huelineId;
      
      await prisma.subBookingData.update({
        where: { huelineId: activeHuelineId },
        data: {
          mockups: {
            create: {
              s3Key: webhookBody.newImagenS3Key,
              roomType: metadata.roomType,
              brand: metadata.brand,
              code: metadata.code,
              name: metadata.name,
              hex: metadata.hex,
            },
          },
          paintColors: {
            create: {
              brand: metadata.brand,
              code: metadata.code,
              name: metadata.name,
              hex: metadata.hex,
            },
          },
        },
      });
    }

    // 4. Generate Context & Presigned URL
    const portalLink = `https://${subdomain.slug}.hue-line.com/j/${activeHuelineId}`;
    const presignedUrl = await getPresignedUrl(webhookBody.newImagenS3Key);

    const context: ImagenContext = {
      colorBrand: metadata.brand,
      colorName: metadata.name,
      colorHex: metadata.hex,
      colorCode: metadata.code,
      recipientName: customer.name || "Customer",
      roomType: metadata.roomType,
      portalLink,
      removeFurniture: metadata.removeFurniture,
      pin: generatedPin,
    };

    // 5. Get Text/Email Content from Config
    const smsBody = config.getSmsBody(context);
    const emailSubject = config.getEmailSubject(context);
    const emailHtml = config.getEmailHtml(context);

    // 6. Send Message
    if (job.deliveryMethod === "SMS" && customer.phone) {
      await twilioClient.messages.create({
        to: customer.phone,
        from: subdomain.twilioPhoneNumber,
        body: smsBody,
        mediaUrl: [presignedUrl],
      });
    } else if (job.deliveryMethod === "EMAIL" && customer.email) {
      await sendEmail({
        to: customer.email,
        subject: emailSubject,
        template: SendMockUpEmail({
          clientName: context.recipientName,
          colors: {
            brand: metadata.brand,
            code: metadata.code,
            hex: metadata.hex,
            name: metadata.name,
          },
          subject: emailSubject,
          body: emailHtml,
        }),
      });
    }

    // 7. Database Transaction (Logs & Activity)
    await prisma.$transaction(async (tx) => {
      // A. Communication Record
      await tx.clientCommunication.create({
        data: {
          body: job.deliveryMethod === "SMS" ? smsBody : emailSubject,
          role: config.role,
          type: job.deliveryMethod as CommunicationType,
          customer: { connect: { id: customer.id } },
          ...(job.operatorId
            ? { operator: { connect: { id: job.operatorId } } }
            : {}),
          mediaAttachments: {
            create: {
              filename: `${metadata.brand}-${metadata.name}-${metadata.code}-mockup.jpg`,
              size: 0,
              mimeType: "image/jpeg",
              mediaSource: "S3",
              mediaUrl: webhookBody.newImagenS3Key,
              compressedKey: webhookBody.compressedS3Key
            },
          },
        },
      });

      // B. Activity Log
      await tx.clientActivity.create({
        data: {
          type: config.activityType,
          title: config.activityTitle(context),
          description: `${config.activityDescription(context)} (via ${job.deliveryMethod})`,
          metadata: { huelineId: activeHuelineId, jobId: job.id },
          customer: { connect: { id: customer.id } },
        },
      });

      // C. System Log
      await tx.logs.create({
        data: {
          title: config.logTitle(context),
          type: "MOCKUP",
          actor: config.logActor,
          description: `${config.logDescription(context)} (via ${job.deliveryMethod})`,
          subdomain: { connect: { id: subdomain.id } },
        },
      });

      // D. Mark Followup Complete
      if (config.markFirstFollowupComplete) {
        await tx.customer.update({
          where: { id: customer.id },
          data: { initialFollowUp: true },
        });
      }
    });
     // Invalidate REDIS THREAD CACHE
      // await invalidateThreadCache(subdomain.slug)
    return { success: true };
  } catch (error) {
    console.error(`[processImagenWorkflow] Failed for ${customer.id}:`, error);
    throw new Error("Failed to process Imagen workflow");
  }
}