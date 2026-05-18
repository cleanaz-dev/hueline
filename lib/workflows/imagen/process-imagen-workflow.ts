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
import { DesignImagenLambdaIngestBody, designImagenLambdaIngestSchema } from "@/lib/zod/design-imagen-body-schema";
import z from "zod";
import { DesignStudioMetadata } from "@/lib/zod/design-studio-metadata";
import { createNewSubBooking } from "./mutations/create-new-subbooking";

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
      `Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}! View your portal here: ${ctx.portalLink}${ctx.pin ? `\n\nYour secure PIN to access the portal is: ${ctx.pin}` : ''}`,
    getEmailSubject: (ctx) => `New Room Mockup - ${ctx.colorName}`,
    getEmailHtml: (ctx) =>
      `<p>Here is your new mockup featuring the ${ctx.colorBrand} palette in ${ctx.colorName}!</p><p><a href="${ctx.portalLink}">View your portal here</a></p>${ctx.pin ? `<p>Your secure PIN to access the portal is: <strong>${ctx.pin}</strong></p>` : ''}`,
  },
};

// ─── Universal Input Zod Schema ───────────────────────────────────────────────
const WorkflowDataSchema = z.object({
  colorBrand: z.string(),
  colorName: z.string(),
  colorCode: z.string(),
  colorHex: z.string(),
  roomType: z.string(),
  originalImageS3Key: z.string(),
  colorSwatchKey: z.string().optional(),
  removeFurniture: z.boolean().optional(),
  huelineId: z.string().nullable().optional(),
  customerId: z.string(),
  customerEmail: z.string().nullable().optional(),
  customerName: z.string().nullable().optional().transform(v => v || "Client"),
  customerPhone: z.string().nullable().optional(),
  subdomainId: z.string({ message: "Missing subdomainId" }),
  designId: z.string({ message: "Missing designProjectId" }),
  newImagenS3Key: z.string({ message: "Missing newImagenKey" }),
  deliveryMethod: z.enum(["SMS", "EMAIL"], { message: "Missing deliveryMethod" }),
  operatorId: z.string().nullable().optional(),
});

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
    const metadata = job.metadata as DesignStudioMetadata;

    // 1. Normalize and Validate Payload Data with Zod
    const p = WorkflowDataSchema.parse({
      colorBrand: metadata.brand,
      colorName: metadata.name,
      colorCode: metadata.code,
      colorHex: metadata.hex,
      roomType: metadata.roomType,
      originalImageS3Key: metadata.imageS3Key,
      colorSwatchKey: metadata.colorSwatchKey,
      removeFurniture: metadata.removeFurniture,
      huelineId: job.huelineId,
      customerId: customer.id,
      customerEmail: customer.email,
      customerName: customer.name,
      customerPhone: customer.phone,
      subdomainId: job.subdomainId,
      designId: metadata.designProjectId,
      newImagenS3Key: webhookBody.newImagenS3Key,
      deliveryMethod: job.deliveryMethod,
      operatorId: job.operatorId,
    });

    const subdomain = await prisma.subdomain.findUnique({
      where: { id: p.subdomainId },
      select: {
        id: true,
        slug: true,
        twilioPhoneNumber: true
      },
    });

    if (!subdomain || !subdomain.twilioPhoneNumber) {
      throw new Error(`Subdomain Data Invalid`);
    }

    // 2. UNIVERSAL DATABASE SAVE 
    let activeHuelineId = p.huelineId;
    let generatedPin: string | undefined = undefined;

    if (!activeHuelineId && triggerSource === "NEW_DESIGN_STUDIO_IMAGEN") {
      const subBookingData = await createNewSubBooking({
        colorBrand: p.colorBrand,
        colorName: p.colorName,
        colorCode: p.colorCode,
        colorHex: p.colorHex,
        roomType: p.roomType,
        originalImageS3Key: p.originalImageS3Key,
        newImagenS3Key: p.newImagenS3Key,
        customerId: p.customerId,
        customerName: p.customerName,
        customerPhone: p.customerPhone || "",
        subdomainId: p.subdomainId,
        designId: p.designId,
      });
      // Capture the generated huelineId and pin
      activeHuelineId = subBookingData.huelineId;
      generatedPin = subBookingData.pin;
    } else if (activeHuelineId) {
      await prisma.subBookingData.update({
        where: { huelineId: activeHuelineId },
        data: {
          mockups: {
            create: {
              s3Key: p.newImagenS3Key,
              roomType: p.roomType,
              brand: p.colorBrand,
              code: p.colorCode,
              name: p.colorName,
              hex: p.colorHex,
            },
          },
          paintColors: {
            create: {
              brand: p.colorBrand,
              code: p.colorCode,
              name: p.colorName,
              hex: p.colorHex,
            },
          },
        },
      });
    } else {
      throw new Error("Missing huelineId and TriggerSource is not NEW_DESIGN_STUDIO_IMAGEN");
    }

    // 3. Generate Context & Presigned URL
    const portalLink = `https://${subdomain.slug}.hue-line.com/j/${activeHuelineId}`;
    const presignedUrl = await getPresignedUrl(p.newImagenS3Key);

    const context: ImagenContext = {
      colorBrand: p.colorBrand,
      colorName: p.colorName,
      colorHex: p.colorHex,
      colorCode: p.colorCode,
      recipientName: p.customerName,
      roomType: p.roomType,
      portalLink,
      removeFurniture: p.removeFurniture,
      pin: generatedPin,
    };

    // 4. Get Text/Email Content from Config
    const smsBody = config.getSmsBody(context);
    const emailSubject = config.getEmailSubject(context);
    const emailHtml = config.getEmailHtml(context);

    // 5. Send Message (Only ONE fires)
    if (p.deliveryMethod === "SMS" && p.customerPhone) {
      await twilioClient.messages.create({
        to: p.customerPhone,
        from: subdomain.twilioPhoneNumber,
        body: smsBody,
        mediaUrl: [presignedUrl],
      });
    } else if (p.deliveryMethod === "EMAIL" && p.customerEmail) {
      await sendEmail({
        to: p.customerEmail,
        subject: emailSubject,
        template: SendMockUpEmail({
          clientName: context.recipientName,
          colors: {
            brand: p.colorBrand,
            code: p.colorCode,
            hex: p.colorHex,
            name: p.colorName,
          },
          subject: emailSubject,
          body: emailHtml,
        }),
      });
    }

    // 6. Database Transaction (Logs & Activity)
    await prisma.$transaction(async (tx) => {
      // A. Communication Record
      await tx.clientCommunication.create({
        data: {
          body: p.deliveryMethod === "SMS" ? smsBody : emailSubject,
          role: config.role,
          type: p.deliveryMethod,
          customer: { connect: { id: p.customerId } },
          ...(p.operatorId ? { operator: { connect: { id: p.operatorId } } } : {}),
          mediaAttachments: {
            create: {
              filename: `${p.colorBrand}-${p.colorName}-${p.colorCode}-mockup.jpg`,
              size: 0,
              mimeType: "image/jpeg",
              mediaSource: "S3",
              mediaUrl: p.newImagenS3Key,
            },
          },
        },
      });

      // B. Activity Log
      await tx.clientActivity.create({
        data: {
          type: config.activityType,
          title: config.activityTitle(context),
          description: `${config.activityDescription(context)} (via ${p.deliveryMethod})`,
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
          description: `${config.logDescription(context)} (via ${p.deliveryMethod})`,
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

    return { success: true };
  } catch (error) {
    console.error(`[processImagenWorkflow] Failed for ${customer.id}:`, error);
    throw new Error("Failed to process Imagen workflow");
  }
}