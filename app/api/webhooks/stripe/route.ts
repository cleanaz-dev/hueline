// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { transporter } from '@/lib/mailer';
import { render } from '@react-email/render';
import { OnboardingEmail } from '@/lib/config/email-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    const company = session.metadata?.company || 'your company';

    if (customerEmail) {
      const emailHtml = await render(
        OnboardingEmail({
          username: customerName || 'there',
          useremail: customerEmail,
          company: company,
        })
      );

      await transporter.sendMail({
        from: '"Hue-Line" <noreply@hue-line.com>',
        to: customerEmail,
        subject: 'Welcome to Hue-Line!',
        html: emailHtml,
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}