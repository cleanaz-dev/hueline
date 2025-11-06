// app/api/webhooks/slack/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('📥 Slack webhook hit');
  
  try {
    const formData = await req.formData();
    const payloadString = formData.get('payload') as string;
    
    if (!payloadString) {
      return NextResponse.json({ error: 'No payload' }, { status: 400 });
    }
    
    const payload = JSON.parse(payloadString);
    console.log('✅ Payload parsed:', payload.type);
    
    return new Response('', { status: 200 });
    
  } catch (error) {
    console.error('❌ Slack webhook error:', error);
    return new Response('', { status: 500 });
  }
}