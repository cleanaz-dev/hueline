import { headers } from 'next/headers';
import Stripe from 'stripe';
import { setupFeeHandler } from '@/lib/handlers/setup-fee-handler';
import { monthlySubscriptionHandler } from '@/lib/handlers/monthly-subscription-handler';
import { annualSubscriptionHandler } from '@/lib/handlers/annual-subscription-handler';

export async function POST(req: Request) {
  // Initialize Stripe inside the function
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover',
  });
  const webhookSecret = process.env.STRIPE_TEST_WEBHOOK_SECRET!;

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Event received:', event.type, event.id);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return new Response(
      JSON.stringify({ error: 'Webhook signature verification failed', details: err.message }),
      { status: 400 }
    );
  }

  // Debug log full event payload
  console.log('📦 Full event payload:', JSON.stringify(event, null, 2));

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('🎉 Checkout session completed:', session.id);

    // ✅ Identify plan type from metadata
    const planType = session.metadata?.plan_type || 'unknown';
    console.log('🧩 Plan Type:', planType);

    try {
      switch (planType) {
        case 'setup':
          await setupFeeHandler(session);
          break;

        case 'monthly':
          await monthlySubscriptionHandler(session);
          break;

        case 'annual':
          await annualSubscriptionHandler(session);
          break;

        default:
          console.warn('⚠️ Unknown plan type, no handler triggered.');
      }
    } catch (err: any) {
      console.error('❌ Error executing handler:', err.message);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
