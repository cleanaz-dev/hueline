import Stripe from 'stripe';
import { render } from '@react-email/render';
import { transporter } from '@/lib/mailer';
import { OnboardingEmail } from '@/lib/config/email-config';
import { MakeHandler } from '@/lib/handlers/make-handler';
import { getClientByEmail } from '@/lib/query';
import { markFeeAsPaid } from '@/lib/handlers/client-status-handler';

interface ClientConfig {
  twilioNumber?: string;
  crm?: string;
  transferNumber?: string;
  subDomain?: string;
  voiceGender?: string;
  voiceName?: string;
  [key: string]: string | undefined; // Add index signature
}


interface ClientRecord {
  name: string;
  email: string;
  company: string;
  phone?: string;
  features?: string[];
  hours?: string;
  config?: ClientConfig;
}

export async function setupFeeHandler(session: Stripe.Checkout.Session): Promise<void> {
  const customerEmail = session.customer_details?.email;

  if (!customerEmail) {
    console.warn('⚠️ No email found for setup fee session.');
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

    // Combine config with aiInfo
    const aiInfo = `
${(client.features || []).map((f) => `• ${f}`).join('\n')}

Active Hours: ${client.hours || 'N/A'}

Configuration:
${client.config ? JSON.stringify(client.config, null, 2) : 'No additional configuration'}
    `.trim();

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