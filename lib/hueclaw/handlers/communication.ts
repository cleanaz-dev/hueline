import {
  ClientActivityType,
  CommunicationRole,
  CommunicationType,
  LogActor,
  LogType,
} from "@/app/generated/prisma";
import { scheduleAWSFollowUp } from "@/lib/aws/event-scheduler";
import { cancelPendingFollowUp } from "@/lib/aws/event-scheduler/cancel-followups";
import { prisma } from "@/lib/prisma";
import { clearHueClawStatus, releaseResourceLock } from "@/lib/redis";
import { sendChatEmail } from "@/lib/resend";
import { sendDefaultSMS } from "@/lib/twilio/sms-default";

// ─── Trigger Source ───────────────────────────────────────────────────────────
// You can easily add more triggers here later (e.g., "FOLLOWUP_COMMS", "QUOTE_COMMS")
export type HueClawCommsTrigger = "STANDARD_AI_REPLY";

interface PendingMessage {
  deliveryMethod: "SMS" | "EMAIL" | "NONE";
  msgBody: string | null;
  msgSubject: string | null;
  reasonForSilence?: string | null;
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
  triggerSource?: HueClawCommsTrigger;
}

export async function handleHueClawCommunication({
  threadId,
  lockKey,
  pendingMessage,
  triggerSource = "STANDARD_AI_REPLY",
}: ProcessCommsArgs) {
  const config = TRIGGER_CONFIG[triggerSource];

  try {
    const { deliveryMethod, msgBody, msgSubject, reasonForSilence } =
      pendingMessage;

    // 1. Fetch Required DB Data
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: {
        customerId: true,
        customer: true,
        id: true,
        subdomainId: true,
        subdomain: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (
      !thread ||
      !thread.customer ||
      !thread.customerId ||
      !thread.subdomainId ||
      !thread.subdomain.slug
    ) {
      throw new Error("Missing required thread, customer, or subdomain data.");
    }

    if (deliveryMethod === "NONE" || !msgBody) {
      console.log(
        `[HueClaw Comms] 🛑 AI paused thread ${threadId}. Reason: ${reasonForSilence}`,
      );

      const triggerAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const reason =
        reasonForSilence || "AI decided to pause the conversation.";

      // Cancel any existing pending follow-up first
      await cancelPendingFollowUp(thread.id);

      const { scheduleName } = await scheduleAWSFollowUp({
        threadId: thread.id,
        triggerAt,
        slug: thread.subdomain.slug,
        trigger: "nudge",
      });

      await prisma.$transaction(async (tx) => {
        await tx.followUpSchedule.create({
          data: {
            title: "HueClaw Scheduled a follow up in 24hrs",
            triggerAt,
            reason,
            scheduleName,
            status: "PENDING",
            chatThread: { connect: { id: thread.id } },
            customer: { connect: { id: thread.customerId } },
            subdomain: { connect: { id: thread.subdomainId } },
          },
        });

        await tx.logs.create({
          data: {
            title: "HueClaw Decided to Follow Up",
            type: "STATUS_CHANGE",
            actor: "AI",
            description: "HueClaw Decided to Follow Up on Conversation",
            subdomain: { connect: { id: thread.subdomainId } },
          },
        });
      });

      return { success: true };
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
    // 1. Try to release the lock safely
    try {
      await releaseResourceLock(lockKey);
      console.log(`[HueClaw Comms] 🔓 Lock released for thread ${threadId}`);
    } catch (lockError) {
      console.error(
        `[HueClaw Comms] Warning: Failed to release lock (might have expired):`,
        lockError,
      );
    }

    // 2. Try to clear the polling status safely
    try {
      await clearHueClawStatus(threadId);
      console.log(`[HueClaw Comms] 🧹 Status cleared for thread ${threadId}`);
    } catch (statusError) {
      console.error(
        `[HueClaw Comms] Warning: Failed to clear HueClaw status:`,
        statusError,
      );
    }
  }
}
