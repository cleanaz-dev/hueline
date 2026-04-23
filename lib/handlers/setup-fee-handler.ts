// lib/handlers/setup-fee-handler.ts
import Stripe from "stripe";
import { render } from "@react-email/render";
import { transporter } from "@/lib/mailer";
import { OnboardingEmail } from "@/lib/config/email-config";
import { prisma } from "../prisma";

export async function setupFeeHandler(
  session: Stripe.Checkout.Session
): Promise<void> {
  const customerEmail = session.customer_details?.email;
  const fullName = session.customer_details?.name || "";
  const firstName = fullName.split(" ")[0] || "";
  const stripeCustomerId = session.customer as string;

  if (!customerEmail) {
    console.warn("⚠️ No email found for setup fee session.");
    return;
  }

  try {
    // 1. UPSERT THE CLIENT
    const client = await prisma.client.upsert({
      where: { email: customerEmail },
      update: {
        stripeCustomerId: stripeCustomerId,
        setupFeePaid: true,
        status: "PENDING_INTAKE"
      },
      create: {
        email: customerEmail,
        firstName: firstName,
        company: fullName, 
        stripeCustomerId: stripeCustomerId,
        setupFeePaid: true,
        status: "PENDING_INTAKE"
      }
    });

    // 2. 🚀 NEW: UPSERT THE DRAFT FORM DATA
    // Because you made fields optional, we can create this safely!
    await prisma.formData.upsert({
      where: { email: customerEmail },
      update: {
        clientId: client.id // Ensure it's linked if it already existed
      },
      create: {
        email: customerEmail,
        name: fullName,
        clientId: client.id,
        // company, phone, crm, etc. are left null for you to fill out later!
      }
    });

    console.log(`✅ Draft Intake Form created for ${customerEmail}.`);

    // 3. SEND ONBOARDING EMAIL
    const emailHtml = await render(
      OnboardingEmail({
        username: client.firstName || "there",
        useremail: customerEmail,
        company: client.company || "your company"
      })
    );

    await transporter.sendMail({
      from: '"Hue-Line" <info@hue-line.com>',
      to: customerEmail,
      subject: "Payment Received! Welcome to Hue-Line! 🎉",
      html: emailHtml,
    });

    console.log(`📧 Onboarding email sent to ${customerEmail}`);

  } catch (err) {
    console.error("❌ Error in setupFeeHandler:", err instanceof Error ? err.message : err);
  }
}