import { render } from "@react-email/render";
import { transporter } from "@/lib/mailer";
import { OnboardingEmail } from "@/lib/config/email-config";
import { MakeHandler } from "@/lib/handlers/make-handler";
import { getClientByEmail } from "@/lib/query";

export async function setupFeeHandler(session: any) {
  const customerEmail = session.customer_details?.email;

  if (!customerEmail) {
    console.warn("⚠️ No email found for setup fee session.");
    return;
  }

  try {
    // ✅ Fetch client record from DB
    const client = await getClientByEmail(customerEmail);

    // ✅ Send onboarding email
    const emailHtml = await render(
      OnboardingEmail({
        username: client?.name || "there",
        useremail: customerEmail,
        company: client.company,
      })
    );

    await transporter.sendMail({
      from: '"Hue-Line" <info@hue-line.com>',
      to: customerEmail,
      subject: "Welcome to Hue-Line! 🎉",
      html: emailHtml,
    });

    console.log(`📧 Onboarding email sent to ${customerEmail}`);

    const aiInfo = `
    ${(client.features || []).map((f) => `• ${f}`).join("\n")}

    Active Hours: ${client.hours || "N/A"}
    `.trim();

    // ✅ Trigger Make automation
    await MakeHandler({
      company: client.company,
      customerEmail: client.email,
      customerName: client.name,
      stripeID: session.customer,
      phone: client.phone,
      voiceAIInfo: aiInfo, // 👈 ONLY this
    });

    console.log(`🧩 Make automation triggered for ${client.company}`);
  } catch (err: any) {
    if (err.name === "NotFoundError") {
      console.warn(`⚠️ No client found for email ${customerEmail}`);
      return;
    }
    console.error("❌ Error in setupFeeHandler:", err.message);
  }
}
