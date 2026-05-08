import { JsonValue } from "@/app/generated/prisma/runtime/library";
import { prisma } from "../prisma";
import { twilioClient } from "./config";
import { CommunicationRole, ClientActivityType, LogActor, LogType } from "@/app/generated/prisma";


// ─── Dynamic Context ──────────────────────────────────────────────────────────

export interface ImagenContext {
  brandName: string;
  colorName: string;
  colorHex: string;
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
      `${ctx.recipientName} generated a ${ctx.roomType ?? "room"} preview using ${ctx.brandName} ${ctx.colorName} (${ctx.colorHex}) from their Hueline portal`,
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
      `System sent automated 2hr followup for ${ctx.recipientName} — ${ctx.brandName} ${ctx.colorName} (${ctx.colorHex}), firstFollowup marked complete`,
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
      `Operator generated a ${ctx.roomType ?? "room"} preview for ${ctx.recipientName} using ${ctx.brandName} ${ctx.colorName} (${ctx.colorHex})`,
    activityType: "GENERATED_IMAGE",
    activityTitle: (ctx) => `Operator Imagen — ${ctx.colorName}`,
    activityDescription: (ctx) =>
      `Operator sent ${ctx.recipientName} a ${ctx.roomType ?? "room"} preview — ${ctx.brandName} ${ctx.colorName}`,
    markFirstFollowupComplete: false,
  },
};

// ─── Media ────────────────────────────────────────────────────────────────────

interface MediaProps {
  mediaUrl: string;
  size: number;
  fileName: string;
  mimeType: string;
}

// ─── Main Function ─────────────────────────────────────────────────────────────

export async function processImagenWorkflow({
  to,
  body,
  demoClientId,
  mediaData,
  role,
  metadata,
  triggerSource,
  context,
  operatorId,
}: {
  to: string;
  body: string;
  demoClientId: string;
  mediaData: MediaProps;
  role: CommunicationRole;
  metadata: JsonValue;
  triggerSource: ImagenTriggerSource;
  context: ImagenContext;
  operatorId?: string;
}) {
  // Grab the dynamic config based on the trigger source
  const config = TRIGGER_CONFIG[triggerSource];

  try {
    // 1. Resolve the subdomain this client belongs to
    const subdomain = await prisma.subdomain.findFirst({
      where: {
        OR:[
          { demoClients: { some: { id: demoClientId } } },
          { clients:     { some: { id: demoClientId } } },
        ],
      },
      select: { id: true, slug: true },
    });

    if(!subdomain) {
      throw new Error
    }
    

    // 2. Send SMS FIRST
    const message = await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
      mediaUrl: [mediaData.mediaUrl],
    });

    // 3. Database Transaction (All or Nothing)
    const communicationId = await prisma.$transaction(async (tx) => {
      
      // Communication record
      const clientCommunication = await tx.clientCommunication.create({
        data: {
          body,
          role,
          type: "IMAGEN",
          demoClient: { connect: { id: demoClientId } },
          ...(triggerSource === "OPERATOR_PORTAL" && operatorId
            ? { operator: { connect: { id: operatorId } } }
            : {}),
        },
      });

      // Media attachment
      await tx.mediaAttachment.create({
        data: {
          clientCommunication: { connect: { id: clientCommunication.id } },
          filename:    mediaData.fileName,
          size:        mediaData.size,
          mimeType:    mediaData.mimeType,
          mediaSource: "S3",
          mediaUrl:    mediaData.mediaUrl,
        },
      });

      // Activity — copy stamped with dynamic context
      await tx.clientActivity.create({
        data: {
          type:        config.activityType,
          title:       config.activityTitle(context),
          description: config.activityDescription(context),
          metadata,
          demoClient: { connect: { id: demoClientId } },
        },
      });

      // Admin log — only written when subdomain is "admin"
  
        await tx.logs.create({
          data: {
            title:       config.logTitle(context),
            type:        "MOCKUP",
            actor:       config.logActor,
            description: config.logDescription(context),
            subdomain:   { connect: { id: subdomain.id } },
          },
        });
      // Cron only — flip firstFollowup so the job won't re-fire
      if (config.markFirstFollowupComplete) {
        await tx.demoClient.update({
          where: { id: demoClientId },
          data:  { initialFollowUp: true },
        });
      }

      return clientCommunication.id;
    });

    return {
      message,
      communicationId,
    };

  } catch (error) {
    console.error(`[sendImagenNotificationSMS] Failed to process SMS for ${to}:`, error);
    throw new Error("Failed to process Imagen SMS notification");
  }
}