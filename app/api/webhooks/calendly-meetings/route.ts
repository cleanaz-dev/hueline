// app/api/webhooks/calendly-meetings/route.ts
import { NextResponse } from 'next/server';
import { sendCalendlyBooking } from '@/lib/slack';

export async function POST(request: Request) {
  console.log('🚨 WEBHOOK HIT - CALENDLY');
  const body = await request.json();
  console.log('📅 FULL CALENDLY PAYLOAD:', JSON.stringify(body, null, 2));
  
  // FIXED: Use the actual payload structure from your logs
  if (body.payload) {
    await sendCalendlyBooking({
      name: body.payload.name || 'Unknown',
      email: body.payload.email,
      eventType: body.payload.scheduled_event?.name || 'Meeting',
      scheduledTime: new Date(body.payload.scheduled_event?.start_time).toLocaleString() || 'Not scheduled'
    });
  }
  
  return NextResponse.json({ received: true });
}

export async function GET() {
  console.log('✅ GET request received - endpoint is working');
  return NextResponse.json({ message: 'Calendly webhook endpoint is live! 🚀' });
}