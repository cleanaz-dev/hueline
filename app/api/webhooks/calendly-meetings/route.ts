// app/api/webhooks/calendly-meetings/route.ts
import { NextResponse } from 'next/server';
import { sendCalendlyBooking } from '@/lib/slack/send-calendly-booking';

export async function POST(request: Request) {
  console.log('🚨 WEBHOOK HIT - CALENDLY');
  const body = await request.json();
  console.log('📅 FULL CALENDLY PAYLOAD:', JSON.stringify(body, null, 2));
  
  if (body.payload) {
    // Pass the correct structure that sendCalendlyBooking expects
    await sendCalendlyBooking({
      event: body.event,  // "invitee.created"
      name: body.payload.name,  // "Test Guy"
      email: body.payload.email,  // "87hendricks@gmail.com"
      scheduled_event: body.payload.scheduled_event  // the event details
    });
  }
  
  return NextResponse.json({ received: true });
}
export async function GET() {
  console.log('✅ GET request received - endpoint is working');
  return NextResponse.json({ message: 'Calendly webhook endpoint is live! 🚀' });
}