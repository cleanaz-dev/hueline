import {
  ClientActivityType,
  CommunicationRole,
  CommunicationType,
  LogActor,
  LogType,
} from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { releaseResourceLock } from "@/lib/redis";
import { sendChatEmail } from "@/lib/resend";
import { sendDefaultSMS } from "@/lib/twilio/sms-default";

// ─── Trigger Source ───────────────────────────────────────────────────────────
// You can easily add more triggers here later (e.g., "FOLLOWUP_COMMS", "QUOTE_COMMS")
export type HueClawCommsTrigger = "STANDARD_AI_REPLY";

interface PendingMessage {
  deliveryMethod: "SMS" | "EMAIL" | "NONE";
  msgBody: string | null;
  msgSubject: string | null;
}

// ─── Dynamic Context ──────────────────────────────────────────────────────────
export interface CommsContext {
  customerName: string;
  deliveryMethod: "SMS" | "EMAIL" | "NONE";
  subject: string | null;
  body: string;
}

// ─── Trigger Config ───────────────────────────────────────────────────────────
interface TriggerConfig {
  logActor: LogActor;
  role: CommunicationRole;
  commType: (ctx: CommsContext) => CommunicationType;
  logTitle: (ctx: CommsContext) => string;
  logType: (ctx: CommsContext) => LogType;
  logDescription: (ctx: CommsContext) => string;
  activityType: (ctx: CommsContext) => ClientActivityType;
  activityTitle: (ctx: CommsContext) => string;
  activityDescription: (ctx: CommsContext) => string;
}

const TRIGGER_CONFIG: Record<HueClawCommsTrigger, TriggerConfig> = {
  STANDARD_AI_REPLY: {
    logActor: "AI",
    role: "AI",
    commType: (ctx) => ctx.deliveryMethod as CommunicationType,
    logTitle: (ctx) =>
      `HueClaw ${ctx.deliveryMethod === "EMAIL" ? "Email" : "SMS"}`,
    logType: (ctx) => ctx.deliveryMethod as LogType,
    logDescription: (ctx) =>
      `AI successfully dispatched an ${ctx.deliveryMethod === "EMAIL" ? "email" : "SMS"} to ${ctx.customerName}.`,
    activityType: (ctx) =>
      (ctx.deliveryMethod === "EMAIL"
        ? "EMAIL_SENT"
        : "SMS_SENT") as ClientActivityType,
    activityTitle: (ctx) =>
      ctx.deliveryMethod === "EMAIL" ? "AI Email Sent" : "AI SMS Sent",
    activityDescription: (ctx) =>
      ctx.deliveryMethod === "EMAIL"
        ? `HueClaw sent an email response. Subject: ${ctx.subject}`
        : `HueClaw sent an SMS response.`,
  },
};

// ─── Main Function ────────────────────────────────────────────────────────────

interface ProcessCommsArgs {
  threadId: string;
  lockKey: string;
  pendingMessage: PendingMessage;
  triggerSource?: HueClawCommsTrigger; // Defaults to STANDARD_AI_REPLY for now
}

export async function handleHueClawCommunication({
  threadId,
  lockKey,
  pendingMessage,
  triggerSource = "STANDARD_AI_REPLY",
}: ProcessCommsArgs) {
  const config = TRIGGER_CONFIG[triggerSource];

  try {
    const { deliveryMethod, msgBody, msgSubject } = pendingMessage;

    // 1. Fetch Required DB Data
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: {
        customerId: true,
        customer: true,
        id: true,
        subdomainId: true,
      },
    });

    if (
      !thread ||
      !thread.customer ||
      !thread.customerId ||
      !thread.subdomainId
    ) {
      throw new Error("Missing required thread, customer, or subdomain data.");
    }

    // 2. Generate Dynamic Context
    const context: CommsContext = {
      customerName: thread.customer.name || "Customer",
      deliveryMethod,
      subject: msgSubject,
      body: msgBody!,
    };

    // 3. Dispatch the actual message
    if (deliveryMethod === "SMS") {
      await sendDefaultSMS({
        to: thread.customer.phone!,
        body: msgBody!,
      });
    } else if (deliveryMethod === "EMAIL") {
      await sendChatEmail({
        to: thread.customer.email!,
        subject: msgSubject!,
        body: msgBody!,
        // replyTo: "", // Add if you have a dynamic reply-to logic
      });
    }

    // 4. Execute Database Saves in a single Transaction
    await prisma.$transaction(async (tx) => {
      // A. Activity Log
      await tx.clientActivity.create({
        data: {
          type: config.activityType(context),
          title: config.activityTitle(context),
          description: config.activityDescription(context),
          chatThread: { connect: { id: thread.id } },
          customer: { connect: { id: thread.customerId } },
          subDomain: { connect: { id: thread.subdomainId } },
        },
      });

      // B. Communication Record
      await tx.clientCommunication.create({
        data: {
          type: config.commType(context),
          ...(pendingMessage.deliveryMethod === "EMAIL" && {
            subject: pendingMessage.msgSubject,
          }),
          role: config.role,
          body: msgBody!,
          chatThread: { connect: { id: threadId } },
          customer: { connect: { id: thread.customerId } },
        },
      });

      // C. System Log
      await tx.logs.create({
        data: {
          title: config.logTitle(context),
          type: config.logType(context),
          actor: config.logActor,
          description: config.logDescription(context),
          subdomain: { connect: { id: thread.subdomainId } },
        },
      });
    });

    console.log(
      `[HueClaw Comms] ✅ Message sent & recorded via ${deliveryMethod} for thread ${threadId}`,
    );

    return { success: true };
  } catch (error) {
    console.error(`[HueClaw Comms] Failed for thread ${threadId}:`, error);
    throw error;
  } finally {
    // 🔓 Always release the lock at the end
    await releaseResourceLock(lockKey);
    console.log(`[HueClaw Comms] 🔓 Lock released for thread ${threadId}`);
  }
}
