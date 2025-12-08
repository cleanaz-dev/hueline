//lib/handlers/setup-fee-handler.ts
import Stripe from "stripe";
import { render } from "@react-email/render";
import { transporter } from "@/lib/mailer";
import { OnboardingEmail } from "@/lib/config/email-config";
import { MakeHandler } from "@/lib/handlers/make-handler";
import { getClientByEmail } from "../prisma";
import { markFeeAsPaid } from "@/lib/handlers/client-status-handler";
import { generateProjectTemplate } from "../aws/aws-template-builder";
import { sendPaymentNotification } from "../slack/send-payment-notification";
import { sendProjectNotification } from "../slack/send-asana-notification";

interface ClientConfig {
  twilioNumber?: string;
  crm?: string;
  transferNumber?: string;
  subDomain?: string;
  voiceGender?: string;
  voiceName?: string;
  [key: string]: string | undefined;
}

interface ClientRecord {
  name: string;
  email: string;
  company: string;
  phone?: string;
  features?: string[];
  hours?: string;
  crm: string;
  config?: ClientConfig;
}

export async function setupFeeHandler(
  session: Stripe.Checkout.Session
): Promise<void> {
  const customerEmail = session.customer_details?.email;

  if (!customerEmail) {
    console.warn("⚠️ No email found for setup fee session.");
    return;
  }

  try {
    const client = (await getClientByEmail(customerEmail)) as ClientRecord | null;

    if (!client) {
      console.warn(`⚠️ No client found for email ${customerEmail}`);
      return;
    }

    // ✅ Mark fee as paid and create activity
    await markFeeAsPaid(customerEmail);

    // 🎯 NOTIFICATION 1: Payment received
    await sendPaymentNotification({
      name: client.name,
      email: customerEmail,
      company: client.company,
      amount: session.amount_total!,
      currency: session.currency!,
      planType: session.metadata?.plan_type || "setup",
    });

    console.log(`💳 Payment notification sent for ${client.company}`);

    // Send onboarding email
    const emailHtml = await render(
      OnboardingEmail({
        username: client.name || "there",
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

    // Combine config with aiInfo
    const aiInfo = `
${(client.features || []).map((f) => `• ${f}`).join("\n")}

Active Hours: ${client.hours || "N/A"}

Configuration:
${
  client.config
    ? JSON.stringify(client.config, null, 2)
    : "No additional configuration"
}
    `.trim();

    // 🚀 STEP 1: Trigger Asana automation via Make
    const makeResult = await MakeHandler({
      company: client.company,
      customerEmail: client.email,
      customerName: client.name,
      crm: client.crm,
      stripeID: session.customer as string,
      phone: client.phone,
      voiceAIInfo: aiInfo,
      plan: session.metadata?.plan_type || "setup"
    });

    // 🚀 STEP 2: Generate project template
    const templateResult = await generateProjectTemplate({
      company: client.company,
      voice_ai_name: client.config?.voiceName || "DefaultAI",
      hue_line_url: client.config?.subDomain 
        ? `https://${client.config.subDomain}.hue-line.com` 
        : "https://default.hue-line.com",
      transfer_to: client.config?.transferNumber || client.phone || "+1234567890"
    });

    // 🎯 SINGLE PROJECT NOTIFICATION: Asana + Template
    await sendProjectNotification({
      project_url: makeResult.project_url,
      crm: client.crm,
      company: client.company,
      name: client.name,
      phone: client.phone || "Not provided",
      email: client.email,
      download_url: templateResult.download_url, // Added this
      s3_key: templateResult.s3_key // Added this
    });

    console.log(`🧩 Complete project setup for ${client.company}`);
    console.log(`   Asana: ${makeResult.project_url}`);
    console.log(`   Template: ${templateResult.download_url}`);

  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Error in setupFeeHandler:", err.message);
    } else {
      console.error("❌ Unknown error in setupFeeHandler:", err);
    }
  }
}