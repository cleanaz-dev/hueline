// /lib/hueclaw/utils/dispatch-pending-message.ts

import { sendChatEmail } from "@/lib/resend";
import { sendDefaultSMS } from "@/lib/twilio/sms-default";

interface PendingMessage {
  deliveryMethod: "SMS" | "EMAIL" | "NONE";
  msgBody: string | null;
  msgSubject: string | null;
}

interface DispatchArgs {
  pendingMessage: PendingMessage;
  phone?: string | null;
  email?: string | null;
}

export async function dispatchPendingMessage({ pendingMessage, phone, email }: DispatchArgs) {
  const { deliveryMethod, msgBody, msgSubject } = pendingMessage;

  if (deliveryMethod === "SMS" && phone) {
    await sendDefaultSMS({ to: phone, body: msgBody! });
  } else if (deliveryMethod === "EMAIL" && email) {
    await sendChatEmail({ to: email, subject: msgSubject!, body: msgBody!, replyTo: "" });
  }
  // NONE = no-op
}