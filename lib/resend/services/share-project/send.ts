import { transporter } from "@/lib/mailer";
import { render } from "@react-email/render";
import { ShareProjectEmail } from "./share-project-email";

export async function sendShareProjectEmail(data: {
  email: string;
  accessType: string;
  pin: string;
  bookingId: string;
}) {
  const emailHtml = await render(
    ShareProjectEmail({
      accessType: data.accessType,
      pin: data.pin,
      bookingId: data.bookingId,
    })
  );

  await transporter.sendMail({
    from: '"Hue-Line" <info@hue-line.com>',
    to: data.email,
    subject: "A project has been shared with you",
    html: emailHtml,
  });
}