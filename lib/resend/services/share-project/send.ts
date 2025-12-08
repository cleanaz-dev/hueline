import { transporter } from "@/lib/mailer";
import { render } from "@react-email/render";
import { ShareProjectEmail } from "./share-project-email"; // Adjust path

export async function sendShareProjectEmail(data: {
  email: string;
  accessType: string;
  pin: string;
  url: string; // 🟢 Required now
}) {
  const emailHtml = await render(
    ShareProjectEmail({
      accessType: data.accessType,
      pin: data.pin,
      url: data.url, // 🟢 Pass it through
    })
  );

  await transporter.sendMail({
    from: '"Hue-Line" <info@hue-line.com>',
    to: data.email,
    subject: "A project has been shared with you",
    html: emailHtml,
  });
}