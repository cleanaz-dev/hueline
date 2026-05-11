
import { prisma } from "@/lib/prisma";
import { twilioClient } from "@/lib/twilio/config";
import { getPresignedUrl } from "@/lib/aws/s3";
import { CommunicationRole, ClientActivityType, LogActor, Job, CommunicationType, Customer } from "@/app/generated/prisma";
import { sendEmail, SendMockUpEmail } from "@/lib/resend";

// ─── Trigger Source ───────────────────────────────────────────────────────────
export type ImagenTriggerSource = "FOLLOWUP_IMAGEN" | "OPERATOR_IMAGEN" | "CLIENT_IMAGEN";

// ─── Dynamic Context ──────────────────────────────────────────────────────────
export interface ImagenContext {
  brandName: string;
  colorName: string;
  colorHex: string;
  colorCode: string;
  recipientName: string;
  roomType: string;
  portalLink: string;
  originalSmsBody?: string;
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
    logTitle: (ctx) => `Client Imagen — ${ctx.brandName} ${ctx.colorName}`,
    logDescription: (ctx) => `${ctx.recipientName} generated a ${ctx.roomType} preview using ${ctx.brandName} ${ctx.colorName}.`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) => `${ctx.recipientName} generated ${ctx.brandName} ${ctx.colorName} on their ${ctx.roomType}`,
    markFirstFollowupComplete: false,
    getSmsBody: (ctx) => `Your requested mockup featuring ${ctx.brandName} in ${ctx.colorName} is ready! View your portal here: ${ctx.portalLink}`,
    getEmailSubject: (ctx) => `Your New Room Mockup - ${ctx.colorName}`,
    getEmailHtml: (ctx) => `<p>Your requested mockup featuring ${ctx.brandName} in ${ctx.colorName} is ready!</p><p><a href="${ctx.portalLink}">View your portal here</a></p>`,
  },

 FOLLOWUP_IMAGEN: {
    logActor: "SYSTEM",
    role: "OPERATOR",
    logTitle: (ctx) => `Followup Imagen — ${ctx.brandName} ${ctx.colorName}`,
    logDescription: (ctx) => `System sent automated followup for ${ctx.recipientName} — ${ctx.brandName} ${ctx.colorName}.`,
    activityType: "FOLLOWUP_IMAGE_SENT",
    activityTitle: (ctx) => `Followup Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) => `Automated followup imagen sent to ${ctx.recipientName} using ${ctx.brandName} ${ctx.colorName}`,
    markFirstFollowupComplete: true,
    
    // NEW AI COPY HERE:
    getSmsBody: (ctx) => `Hey! It's been 24 hours since you tested our demo! Based on the colors you tried earlier, our AI design assistant thought ${ctx.brandName} ${ctx.colorName} (${ctx.colorCode}) would look incredible in your space. What do you think?\n\nView your new mockup here: ${ctx.portalLink}`,
    getEmailSubject: (ctx) => `Your AI Room Preview - ${ctx.colorName}`,
    getEmailHtml: (ctx) => `<p>Hey! It's been 24 hours since you tested our demo! Based on the colors you tried earlier, our AI design assistant thought ${ctx.brandName} ${ctx.colorName} (${ctx.colorCode}) would look incredible in your space. What do you think?</p><p><a href="${ctx.portalLink}">View your new mockup here</a></p>`,
  },

  OPERATOR_IMAGEN: {
    logActor: "PAINTER",
    role: "OPERATOR",
    logTitle: (ctx) => `Operator Imagen — ${ctx.brandName} ${ctx.colorName}`,
    logDescription: (ctx) => `Operator generated a ${ctx.roomType} preview for ${ctx.recipientName} using ${ctx.brandName} ${ctx.colorName}.`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `Operator Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) => `Operator sent ${ctx.recipientName} a ${ctx.roomType} preview — ${ctx.brandName} ${ctx.colorName}`,
    markFirstFollowupComplete: false,
    getSmsBody: (ctx) => `Here is your new mockup featuring the ${ctx.brandName} palette in ${ctx.colorName}! View your portal here: ${ctx.portalLink}`,
    getEmailSubject: (ctx) => `New Room Mockup - ${ctx.colorName}`,
    getEmailHtml: (ctx) => `<p>Here is your new mockup featuring the ${ctx.brandName} palette in ${ctx.colorName}!</p><p><a href="${ctx.portalLink}">View your portal here</a></p>`,
  },
};

// ─── Main Function ────────────────────────────────────────────────────────────

interface ProcessImagenArgs {
  webhookBody: any;
  triggerSource: ImagenTriggerSource;
  job: Job;
  customer: Customer;
  operatorId?: string | null;
}

export async function processImagenWorkflow({ webhookBody, triggerSource, job, customer, operatorId }: ProcessImagenArgs) {
  const config = TRIGGER_CONFIG[triggerSource];

  try {
    // 1. Normalize Payload Data seamlessly 
    const activeColor = webhookBody.targetColor || webhookBody.color || {};
    const brandName = webhookBody.brand || activeColor.brand || "RAL";
    const colorName = activeColor.name || "Selected Color";
    const colorCode = activeColor.code || "";
    const colorHex = activeColor.hex || "";
    const roomType = webhookBody.roomType || "Room";
    const s3Key = webhookBody.s3Key;
    const huelineId = webhookBody.huelineId;

    // Determine strict delivery method
    const deliveryMethod = job.deliveryMethod as CommunicationType
    if(!deliveryMethod) {
      throw new Error
    }

    // 2. UNIVERSAL DATABASE SAVE (Happens every time, no exceptions)
    const subBookingData = await prisma.subBookingData.update({
      where: { huelineId },
      include: { subdomain: true },
      data: {
        mockups: {
          create: {
            s3Key, roomType,
            brand: brandName,
            code: colorCode,
            name: colorName,
            hex: colorHex,
          },
        },
        paintColors: {
          create: {
            brand: brandName,
            code: colorCode,
            name: colorName,
            hex: colorHex,
          },
        },
      },
    });

    // 3. Generate Context & Presigned URL
    const portalLink = `https://${subBookingData.subdomain.slug}.hue-line.com/j/${huelineId}`;
    const presignedUrl = await getPresignedUrl(s3Key);

    const context: ImagenContext = {
      brandName,
      colorName,
      colorHex,
      colorCode,
      recipientName: customer.name || "Client",
      roomType,
      portalLink,
      originalSmsBody: webhookBody.smsBody,
    };

    // 4. Get Text/Email Content from Config
    const smsBody = config.getSmsBody(context);
    const emailSubject = config.getEmailSubject(context);
    const emailHtml = config.getEmailHtml(context);

    // 5. Send Message (Only ONE fires)
    if (deliveryMethod === "SMS" && customer.phone) {
      await twilioClient.messages.create({
        to: customer.phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: smsBody,
        mediaUrl: [presignedUrl],
      });
    } else if (deliveryMethod === "EMAIL" && customer.email) {
      await sendEmail({
        to: customer.email,
        subject: emailSubject,
        template: SendMockUpEmail({
          clientName: context.recipientName,
          colors: { brand: brandName, code: colorCode, hex: colorHex, name: colorName },
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
          body: deliveryMethod === "SMS" ? smsBody : emailSubject,
          role: config.role,
          type: deliveryMethod, 
          customer: { connect: { id: customer.id } },
          ...(operatorId ? { operator: { connect: { id: operatorId } } } : {}),
          mediaAttachments: {
            create: {
              filename: `${brandName}-mockup.jpg`,
              size: 0,
              mimeType: "image/jpeg",
              mediaSource: "S3",
              mediaUrl: s3Key,
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
          type: "MOCKUP",
          actor: config.logActor,
          description: `${config.logDescription(context)} (via ${deliveryMethod})`,
          subdomain: { connect: { id: subBookingData.subdomain.id } },
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