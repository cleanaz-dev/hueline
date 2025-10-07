import Stripe from 'stripe';
import { transporter } from '@/lib/mailer';
import { render } from '@react-email/render';
import { SubscriptionEmail } from '@/lib/config/email-config';
import { MakeHandler } from './make-handler'; // import your MakeHandler

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function monthlySubscriptionHandler(session: any) {
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;

  if (!customerEmail) {
    console.warn('⚠️ No customer email found for monthly subscription');
    return;
  }

  // Extract company name
  let company = 'your company';
  const customFields = session.custom_fields;
  if (Array.isArray(customFields)) {
    const companyField = customFields.find((f: any) => f.key === 'company');
    if (companyField?.text?.value) {
      company = companyField.text.value;
    }
  }

  console.log('💳 [Monthly Subscription] Customer:', { customerEmail, customerName, company });

  // Create or retrieve customer in Stripe
  const existingCustomer = await stripe.customers.list({ email: customerEmail, limit: 1 });
  let customer = existingCustomer.data[0];

  if (!customer) {
    customer = await stripe.customers.create({
      email: customerEmail,
      name: customerName || '',
      metadata: { company },
    });
    console.log(`👤 Created new Stripe customer: ${customer.id}`);
  } else {
    console.log(`👤 Existing Stripe customer found: ${customer.id}`);
  }

  // Send subscription confirmation email
  const emailHtml = await render(
    SubscriptionEmail({
      username: customerName || 'there',
      useremail: customerEmail,
      company,
      plan: 'Monthly',
    })
  );

  await transporter.sendMail({
    from: '"Hue-Line" <info@hue-line.com>',
    to: customerEmail,
    subject: 'Your Hue-Line Monthly Subscription is Active!',
    html: emailHtml,
  });

  console.log(`📧 Monthly subscription email sent to ${customerEmail}`);

  // // ✅ Send client data to Make
  // await MakeHandler({
  //   company,
  //   customerName: customerName || 'there',
  //   customerEmail,
  //   phone: session.customer_details?.phone || '',
  //   stripeID: customer.id,
  //   voiceAIInfo: session.metadata?.voice_ai_info || '',
  //   plan: 'Monthly',
  // });

  console.log(`🚀 Client data sent to Make for ${company}`);
}
