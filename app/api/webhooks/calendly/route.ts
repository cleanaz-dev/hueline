// app/api/webhooks/calendly/route.ts
import { NextResponse } from 'next/server';
import { sendCalendlyBooking } from '@/lib/slack';

export async function POST(request: Request) {
  console.log('🚨 WEBHOOK HIT - CALENDLY');
  const body = await request.json();
  console.log('📅 Calendly Webhook Received:', body);
  
  // Extract data from Calendly payload and send to Slack
  if (body.payload?.invitee && body.payload?.event) {
    await sendCalendlyBooking({
      name: body.payload.invitee.name || 'Unknown',
      email: body.payload.invitee.email,
      eventType: body.payload.event_type.name,
      scheduledTime: new Date(body.payload.scheduled_time).toLocaleString()
    });
  }
  
  return NextResponse.json({ received: true });
}

export async function GET() {
  console.log('✅ GET request received - endpoint is working');
  return NextResponse.json({ message: 'Calendly webhook endpoint is live! 🚀' });
}