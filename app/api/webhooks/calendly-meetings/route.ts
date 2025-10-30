// 

// app/api/webhooks/calendly-meetings/route.ts
import { NextResponse } from 'next/server';
import { sendCalendlyBooking } from '@/lib/slack';

export async function POST(request: Request) {
  console.log('🚨 WEBHOOK HIT - CALENDLY');

  let body: any = {};
  try {
    body = await request.json();
  } catch (err) {
    console.log('⚠️ Non-JSON payload (possibly verification):', err);
    return NextResponse.json({ ok: true, message: 'Verification acknowledged' }, { status: 200 });
  }

  console.log('📅 Calendly Webhook Received:', body);

  if (body?.payload) {
    await sendCalendlyBooking({
      name: body.payload.name || 'Unknown',
      email: body.payload.email,
      eventType: body.payload.scheduled_event?.name || 'Meeting',
      scheduledTime:
        new Date(body.payload.scheduled_event?.start_time).toLocaleString() || 'Not scheduled',
    });
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  console.log('✅ GET request received - endpoint is working');
  return NextResponse.json({ message: 'Calendly webhook endpoint is live! 🚀' });
}
