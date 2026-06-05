// /lib/hueclaw/handlers/comms.ts

import { prisma } from "@/lib/prisma";
import { releaseResourceLock } from "@/lib/redis";

interface PendingMessage {
  deliveryMethod: "SMS" | "EMAIL";
  msgBody: string;
  msgSubject: string | null;
}

export async function handleHueClawCommunication(
  threadId: string,
  lockKey: string,
  pendingMessage: PendingMessage,
) {
  try {
    const { deliveryMethod, msgBody, msgSubject } = pendingMessage;

    // TODO: Call Twilio / SendGrid / your actual delivery service here
    // if (deliveryMethod === "SMS") {
    //   await sendSms(...)
    // } else {
    //   await sendEmail(...)
    // }

    // --- Find the customer from the thread ---
    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { customerId: true },
    });

    if (!thread?.customerId) {
      throw new Error("No customer found for thread");
    }

    await prisma.clientCommunication.create({
      data: {
        type: deliveryMethod,
        role: "AI",
        body: msgBody,
        chatThread: { connect: { id: threadId } },
        customer: { connect: { id: thread.customerId } },
      },
    });

    console.log(`[HueClaw Comms] ✅ Message sent & recorded for thread ${threadId}`);

  } catch (error) {
    console.error("[HueClaw Comms] Error:", error);
    throw error; // Re-throw so the caller's catch block handles lock release
  } finally {
    // 🔓 Always release the lock at the end of the chain
    await releaseResourceLock(lockKey);
    console.log(`[HueClaw Comms] 🔓 Lock released for thread ${threadId}`);
  }
}
