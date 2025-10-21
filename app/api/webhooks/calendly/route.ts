// app/api/webhooks/calendly/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  console.log('📅 Calendly Webhook Received:', body);
  
  // Process the booking data here
  
  return NextResponse.json({ received: true });
}