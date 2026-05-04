// lib/handlers/setup-fee-handler.ts
import Stripe from "stripe";
import { render } from "@react-email/render";
import { transporter } from "@/lib/mailer";
import { OnboardingEmail } from "../resend";
import { sendEmail } from "../resend/send-email";
import { prisma } from "../prisma";

export async function setupFeeHandler(
  session: Stripe.Checkout.Session,
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
        status: "PENDING_INTAKE",
      },
      create: {
        email: customerEmail,
        firstName: firstName,
        company: fullName,
        stripeCustomerId: stripeCustomerId,
        setupFeePaid: true,
        status: "PENDING_INTAKE",
      },
    });

    // 2. 🚀 NEW: UPSERT THE DRAFT FORM DATA
    // Because you made fields optional, we can create this safely!
    await prisma.formData.upsert({
      where: { email: customerEmail },
      update: {
        clientId: client.id, // Ensure it's linked if it already existed
      },
      create: {
        email: customerEmail,
        name: fullName,
        clientId: client.id,
        // company, phone, crm, etc. are left null for you to fill out later!
      },
    });

    console.log(`✅ Draft Intake Form created for ${customerEmail}.`);

    await sendEmail({
      to: customerEmail,
      subject: "Payment Received! Welcome to Hue-Line! 🎉",
      template: OnboardingEmail({
        username: client.firstName || "there",
        useremail: customerEmail,
        company: client.company || "your company",
      }),
    });

    // // 3. SEND ONBOARDING EMAIL
    // const emailHtml = await render(
    //   OnboardingEmail({
    //     username: client.firstName || "there",
    //     useremail: customerEmail,
    //     company: client.company || "your company",
    //   }),
    // );

    // await transporter.sendMail({
    //   from: '"Hue-Line" <info@hue-line.com>',
    //   to: customerEmail,
    //   subject: "Payment Received! Welcome to Hue-Line! 🎉",
    //   html: emailHtml,
    // });

    console.log(`📧 Onboarding email sent to ${customerEmail}`);
    // 🚀 BATCH CREATE LOGS WITH METADATA
    await prisma.clientActivity.createMany({
      data: [
        {
          clientId: client.id,
          type: "CLIENT_CREATED",
          title: "Client Account Registered",
          description: `Account initialized via Stripe Checkout for ${customerEmail}.`,
        },
        {
          clientId: client.id,
          type: "SETUP_FEE_PAID",
          title: "Setup Fee Paid",
          description: "Successfully processed the initial setup fee payment.",
          // Store the raw Stripe session ID for future debugging!
          metadata: {
            stripeSessionId: session.id,
            amountTotal: session.amount_total,
          },
        },
        {
          clientId: client.id,
          type: "EMAIL_SENT",
          title: "Onboarding Email Sent",
          description:
            "Sent Client Onboarding Email after successful SETUP FEE PAID.",
          metadata: {
            recipient: customerEmail,
            subject: "Payment Received! Welcome to Hue-Line! 🎉",
          },
        },
      ],
    });

    console.log(`📝 Activity logs created for ${customerEmail}.`);
  } catch (err) {
    console.error(
      "❌ Error in setupFeeHandler:",
      err instanceof Error ? err.message : err,
    );
  }
}
