import { transporter } from "@/lib/mailer";
import { render } from "@react-email/render";
import { SubscriptionLink } from "@/lib/config/email-config";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, name, company } = await req.json();

    const emailHtml = await render(
      SubscriptionLink({
        name,
        company,
        subLink:
          "https://buy.stripe.com/test_3cI9AUgwIfI958EabLgQE01?prefilled_email=" +
          encodeURIComponent(email),
      })
    );

    await transporter.sendMail({
      from: '"Hue-Line" <info@hue-line.com>',
      to: email,
      subject: "Your Subscription Link",
      html: emailHtml,
    });

    await prisma.formData.update({
      where: {
        email,
      },
      data: {
        subLinkSent: true,
      },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Error sending subscription email:", err);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
