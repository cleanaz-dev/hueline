import * as React from "react";
import { resend } from "./config";


interface SendEmailProps {
  to: string;
  subject: string;
  template: React.ReactNode; // 👈 This is the magic part! Accepts any component
}

export async function sendEmail({ to, subject, template }: SendEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Hue-Line <info@hue-line.com>", // Your verified domain
      to: [to],
      subject: subject,
      react: template, // 👈 Just drop the component right in here
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      return { success: false, error };
    }

    console.log(`✅ Email sent to ${to}. ID: ${data?.id}`);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    return { success: false, error };
  }
}