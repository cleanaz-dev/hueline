import { transporter } from "@/lib/mailer";
import { render } from "@react-email/render";
import { ActivateSubscriptionLink } from "@/lib/resend";
import { sendEmail } from "@/lib/resend/send-email";

export async function POST(req: Request) {
  try {
    const { email, name, company } = await req.json();

    await sendEmail({
      to: email,
      subject: "Your Subscription Link",
      template: ActivateSubscriptionLink({
        name, company, email
      })
    })

    // await transporter.sendMail({
    //   from: '"Hue-Line" <info@hue-line.com>',
    //   to: email,
    //   subject: "Your Subscription Link",
    //   html: emailHtml,
    // });


    return Response.json({ success: true });
  } catch (err) {
    console.error("Error sending subscription email:", err);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}