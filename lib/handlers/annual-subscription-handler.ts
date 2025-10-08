import Stripe from 'stripe';
import { transporter } from '@/lib/mailer';
import { render } from '@react-email/render';
import { SubscriptionEmail } from '@/lib/config/email-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Define a safe interface for custom fields
interface CustomField {
  key: string;
  text?: { value: string };
}

export async function annualSubscriptionHandler(session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;

  if (!customerEmail) {
    console.warn('⚠️ No customer email found for annual subscription');
    return;
  }

  // Extract company name
  let company = 'your company';
  const customFields = session.custom_fields as CustomField[] | null | undefined;

  if (Array.isArray(customFields)) {
    const companyField = customFields.find((f) => f.key === 'company');
    if (companyField?.text?.value) {
      company = companyField.text.value;
    }
  }

  console.log('💳 [Annual Subscription] Customer:', { customerEmail, customerName, company });

  // ✅ Create or retrieve customer in Stripe
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

  // ✅ Send subscription confirmation email
  const emailHtml = await render(
    SubscriptionEmail({
      username: customerName || 'there',
      useremail: customerEmail,
      company,
      plan: 'Annual',
    })
  );

  await transporter.sendMail({
    from: '"Hue-Line" <info@hue-line.com>',
    to: customerEmail,
    subject: 'Your Hue-Line Annual Subscription is Active!',
    html: emailHtml,
  });

  console.log(`📧 Annual subscription email sent to ${customerEmail}`);
}
