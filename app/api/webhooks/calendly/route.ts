// app/api/webhooks/calendly/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('🚨 WEBHOOK HIT - CALENDLY');
  const body = await request.json();
  console.log('📅 Calendly Webhook Received:', body);
  
  return NextResponse.json({ received: true });
}

export async function GET() {
  console.log('✅ GET request received - endpoint is working');
  return NextResponse.json({ message: 'Calendly webhook endpoint is live! 🚀' });
}
