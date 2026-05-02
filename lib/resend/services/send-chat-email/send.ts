import { render } from "@react-email/render";
import { SendChatEmail } from "./send-chat-email";
import { transporter } from "@/lib/mailer";

export async function sendChatEmail(data: {
   subject: string;
   body: string;
   attachementUrl?: string
   email: string
}) {
    const emailHtml = await render(
        SendChatEmail({
            subject: data.subject,
            body: data.body,
            attachmentUrl: data.attachementUrl
        })
    )

      await transporter.sendMail({
        from: '"Hue-Line" <info@hue-line.com>',
        to: data.email,
        subject: data.subject,
        html: emailHtml,
      })
}