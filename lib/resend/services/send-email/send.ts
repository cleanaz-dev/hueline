import { transporter } from "@/lib/mailer";
import { render } from "@react-email/render";
import { SendBasicEmail } from "./send-basic-email";

export async function sendBasicEmail(data: {
  email: string;
  subject: string;
  body: string;
}) {
  const emailHtml = await render(
    SendBasicEmail({
      subject: data.subject,
      body: data.body,
    })
  );

  await transporter.sendMail({
    from: '"Hue-Line" <info@hue-line.com>',
    to: data.email,
    subject: data.subject,
    html: emailHtml,
  });
}