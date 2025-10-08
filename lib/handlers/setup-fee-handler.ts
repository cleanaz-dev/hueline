import Stripe from 'stripe';
import { render } from '@react-email/render';
import { transporter } from '@/lib/mailer';
import { OnboardingEmail } from '@/lib/config/email-config';
import { MakeHandler } from '@/lib/handlers/make-handler';
import { getClientByEmail } from '@/lib/query';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Optional — helpful to define expected client shape for better safety
interface ClientRecord {
  name: string;
  email: string;
  company: string;
  phone?: string;
  features?: string[];
  hours?: string;
}

export async function setupFeeHandler(session: Stripe.Checkout.Session): Promise<void> {
  const customerEmail = session.customer_details?.email;

  if (!customerEmail) {
    console.warn('⚠️ No email found for setup fee session.');
    return;
  }

  try {
    // ✅ Fetch client record from DB
    const client = (await getClientByEmail(customerEmail)) as ClientRecord | null;

    if (!client) {
      console.warn(`⚠️ No client found for email ${customerEmail}`);
      return;
    }

    // ✅ Send onboarding email
    const emailHtml = await render(
      OnboardingEmail({
        username: client.name || 'there',
        useremail: customerEmail,
        company: client.company,
      })
    );

    await transporter.sendMail({
      from: '"Hue-Line" <info@hue-line.com>',
      to: customerEmail,
      subject: 'Welcome to Hue-Line! 🎉',
      html: emailHtml,
    });

    console.log(`📧 Onboarding email sent to ${customerEmail}`);

    // ✅ Compile Voice AI info for Make automation
    const aiInfo = `
${(client.features || []).map((f) => `• ${f}`).join('\n')}

Active Hours: ${client.hours || 'N/A'}
    `.trim();

    // ✅ Trigger Make automation
    await MakeHandler({
      company: client.company,
      customerEmail: client.email,
      customerName: client.name,
      stripeID: session.customer as string,
      phone: client.phone,
      voiceAIInfo: aiInfo,
    });

    console.log(`🧩 Make automation triggered for ${client.company}`);
  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ Error in setupFeeHandler:', err.message);
    } else {
      console.error('❌ Unknown error in setupFeeHandler:', err);
    }
  }
}
