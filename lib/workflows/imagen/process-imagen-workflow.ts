import { JsonValue } from "@/app/generated/prisma/runtime/library";
import { prisma } from "@/lib/prisma";
import { twilioClient } from "@/lib/twilio/config";
import { CommunicationRole, ClientActivityType, LogActor, LogType } from "@/app/generated/prisma";
import { sendEmail, SendMockUpEmail } from "@/lib/resend";


// ─── Dynamic Context ──────────────────────────────────────────────────────────

export interface ImagenContext {
  brandName: string;
  colorName: string;
  colorHex: string;
  colorCode: string;
  recipientName: string;
  roomType?: string;
}

// ─── Trigger Source ───────────────────────────────────────────────────────────

export type ImagenTriggerSource =
  | "CLIENT_PORTAL"
  | "CRON_FOLLOWUP"
  | "OPERATOR_PORTAL";

// ─── Trigger Config (templates, not hardcoded strings) ────────────────────────

interface TriggerConfig {
  logActor: LogActor;
  logTitle: (ctx: ImagenContext) => string;
  logDescription: (ctx: ImagenContext) => string;
  activityType: ClientActivityType;
  activityTitle: (ctx: ImagenContext) => string;
  activityDescription: (ctx: ImagenContext) => string;
  markFirstFollowupComplete: boolean;
}

const TRIGGER_CONFIG: Record<ImagenTriggerSource, TriggerConfig> = {
  CLIENT_PORTAL: {
    logActor: "CLIENT",
    logTitle: (ctx) => `Client Imagen — ${ctx.brandName} ${ctx.colorName}`,
    logDescription: (ctx) =>
      // Changed colorHex to colorCode here! e.g., "Sherwin Williams Alabaster (SW 7008)"
      `${ctx.recipientName} generated a ${ctx.roomType ?? "room"} preview using ${ctx.brandName} ${ctx.colorName} (${ctx.colorCode}) from their Hueline portal`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `${ctx.recipientName} previewed ${ctx.brandName} ${ctx.colorName} on their ${ctx.roomType ?? "room"}`,
    markFirstFollowupComplete: false,
  },

  CRON_FOLLOWUP: {
    logActor: "SYSTEM",
    logTitle: (ctx) => `Followup Imagen — ${ctx.brandName} ${ctx.colorName}`,
    logDescription: (ctx) =>
      // Changed colorHex to colorCode here!
      `System sent automated 2hr followup for ${ctx.recipientName} — ${ctx.brandName} ${ctx.colorName} (${ctx.colorCode}), firstFollowup marked complete`,
    activityType: "FOLLOWUP_IMAGE_SENT",
    activityTitle: (ctx) => `Followup Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `Automated followup imagen sent to ${ctx.recipientName} for ${ctx.roomType ?? "room"} using ${ctx.brandName} ${ctx.colorName}`,
    markFirstFollowupComplete: true,
  },

  OPERATOR_PORTAL: {
    logActor: "PAINTER",
    logTitle: (ctx) => `Operator Imagen — ${ctx.brandName} ${ctx.colorName}`,
    logDescription: (ctx) =>
      // Changed colorHex to colorCode here!
      `Operator generated a ${ctx.roomType ?? "room"} preview for ${ctx.recipientName} using ${ctx.brandName} ${ctx.colorName} (${ctx.colorCode})`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `Operator Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `Operator sent ${ctx.recipientName} a ${ctx.roomType ?? "room"} preview — ${ctx.brandName} ${ctx.colorName}`,
    markFirstFollowupComplete: false,
  },
};

// ─── Media ────────────────────────────────────────────────────────────────────

interface MediaProps {
  s3Key: string;         // Stored in the DB permanently
  presignedUrl: string;  // Given to Twilio so it can fetch the image right now
  size: number;
  fileName: string;
  mimeType: string;
}


// ─── Main Function ─────────────────────────────────────────────────────────────

export async function processImagenWorkflow({
  toPhone,        // Changed to clarify this is the phone
  toEmail,        // Added for email
  smsBody,
  emailSubject,
  emailHtml,
  demoClientId,
  mediaData,
  role,
  metadata,
  triggerSource,
  context,
  operatorId,
  deliveryMethod, // "SMS" | "EMAIL" | "BOTH"
}: {
  toPhone?: string | null;
  toEmail?: string | null;
  smsBody?: string;
  emailSubject?: string;
  emailHtml?: string;
  demoClientId: string;
  mediaData: MediaProps;
  role: CommunicationRole;
  metadata: JsonValue;
  triggerSource: ImagenTriggerSource;
  context: ImagenContext;
  operatorId?: string | null;
  deliveryMethod: "SMS" | "EMAIL" | "BOTH";
}) {
  const config = TRIGGER_CONFIG[triggerSource];

  try {
    const subdomain = await prisma.subdomain.findFirst({
      where: {
        OR:[
          { demoClients: { some: { id: demoClientId } } },
          { clients:     { some: { id: demoClientId } } },
        ],
      },
      select: { id: true, slug: true },
    });

    // 1. Send External Messages First
    let twilioMessage;
    let resendMessage;
    if (!subdomain) {
      throw new Error
    }

       if ((deliveryMethod === "SMS" || deliveryMethod === "BOTH") && toPhone && smsBody) {
      await twilioClient.messages.create({
        to: toPhone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: smsBody,
        // Twilio gets the temporary presigned URL!
        mediaUrl:[mediaData.presignedUrl], 
      });
    }

    if ((deliveryMethod === "EMAIL" || deliveryMethod === "BOTH") && toEmail && emailSubject && emailHtml) {
      await sendEmail({
        to: toEmail,
        subject: emailSubject,
        template: SendMockUpEmail({
          clientName: context.recipientName,
          colors: {
            brand: context.brandName,
            code:context.colorCode,
            hex: context.colorHex,
            name: context.colorName,
          },
          subject: emailSubject,
          body: emailHtml
        })
      });
    }

    // 2. Database Transaction
    const results = await prisma.$transaction(async (tx) => {
      
      const communicationIds: string[] =[];

      // A. Create SMS Record if applicable
      if (deliveryMethod === "SMS" || deliveryMethod === "BOTH") {
        const smsComm = await tx.clientCommunication.create({
          data: {
            body: smsBody || "SMS Sent",
            role,
            type: "SMS",
            demoClient: { connect: { id: demoClientId } },
            ...(operatorId ? { operator: { connect: { id: operatorId } } } : {}),
            mediaAttachments: {
              create: {
                filename: mediaData.fileName,
                size: mediaData.size,
                mimeType: mediaData.mimeType,
                mediaSource: "S3",
                mediaUrl: mediaData.s3Key,
              }
            }
          },
        });
        communicationIds.push(smsComm.id);
      }

      // B. Create EMAIL Record if applicable
      if (deliveryMethod === "EMAIL" || deliveryMethod === "BOTH") {
        const emailComm = await tx.clientCommunication.create({
          data: {
            body: emailSubject || "Email Sent", // Storing subject as the main body text for logs
            role,
            type: "EMAIL",
            demoClient: { connect: { id: demoClientId } },
            ...(operatorId ? { operator: { connect: { id: operatorId } } } : {}),
            mediaAttachments: {
              create: {
                filename: mediaData.fileName,
                size: mediaData.size,
                mimeType: mediaData.mimeType,
                mediaSource: "S3",
                mediaUrl: mediaData.s3Key,
              }
            }
          },
        });
        communicationIds.push(emailComm.id);
      }

      // C. Activity & Logs (We just write ONE activity, no matter how many methods were used)
      await tx.clientActivity.create({
        data: {
          type: config.activityType,
          title: config.activityTitle(context),
          description: `${config.activityDescription(context)} (via ${deliveryMethod})`,
          metadata,
          demoClient: { connect: { id: demoClientId } },
        },
      });

     
        await tx.logs.create({
          data: {
            title: config.logTitle(context),
            type: "MOCKUP",
            actor: config.logActor,
            description: `${config.logDescription(context)} (via ${deliveryMethod})`,
            subdomain: { connect: { id: subdomain.id } },
          },
        });
    

      // D. Mark Followup Complete
      if (config.markFirstFollowupComplete) {
        await tx.demoClient.update({
          where: { id: demoClientId },
          data: { initialFollowUp: true },
        });
      }

      return communicationIds;
    });

    return { success: true, communicationIds: results };

  } catch (error) {
    console.error(`[processImagenWorkflow] Failed for ${demoClientId}:`, error);
    throw new Error("Failed to process Imagen workflow");
  }
}