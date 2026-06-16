import { Resend } from "resend";
import { ChatEmailTemplate } from "../emails";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendChatEmail({
  to,
  subject,
  body,
  replyTo,
  attachmentUrl,
}: {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
  attachmentUrl?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      replyTo, // <-- Leave it exactly like this!
      from: "Hue-Line <info@hue-line.com>",
      to: [to],
      subject: subject,
      react: ChatEmailTemplate({ subject, body, attachmentUrl }),
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      return { success: false, error };
    }

    console.log(`✅ Chat email sent to ${to}. ID: ${data?.id}`);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Failed to send chat email:", error);
    return { success: false, error };
  }
}
