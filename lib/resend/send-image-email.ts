import * as React from "react";
import { resend } from "./config";

interface SendEmailProps {
  to: string;
  subject: string;
  template: React.ReactElement;  // ✅ was ReactNode
  imageUrl?: string;
  attachmentType?: "image" | "document";
}

export async function sendEmailWithAttachment({
  to,
  subject,
  template,
  imageUrl,
  attachmentType = "image",
}: SendEmailProps) {
  const attachments = [];

  if (imageUrl) {
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = imageUrl.split("/").pop()?.split("?")[0] || "attachment";

    attachments.push({
      filename,
      content: buffer,
      contentType:
        attachmentType === "image"
          ? `image/${filename.split(".").pop() || "png"}`
          : "application/octet-stream",
    });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Hue-Line <info@hue-line.com>",
      to: [to],
      subject,
      react: template,  // ✅ Resend handles rendering
      attachments: attachments.length ? attachments : undefined,
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