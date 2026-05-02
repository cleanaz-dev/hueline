import { Resend } from "resend";
import { ChatEmailTemplate } from "../emails";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendChatEmail({
  to,
  subject,
  body,
  attachmentUrl,
}: {
  to: string;
  subject: string;
  body: string;
  attachmentUrl?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Hue-Line <info@hue-line.com>", // Make sure info@hue-line.com is verified in Resend!
      to: [to],
      subject: subject,
      // Resend magically takes the React component directly! No rendering required.
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