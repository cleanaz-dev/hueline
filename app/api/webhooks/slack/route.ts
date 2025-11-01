// app/api/webhooks/slack/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('📩 Slack interaction received!');
    
    // Get the form data
    const formData = await req.formData();
    const payloadString = formData.get('payload') as string;
    
    console.log('Raw payload:', payloadString);
    
    // Parse the JSON payload
    const payload = JSON.parse(payloadString);
    
    console.log('Parsed payload:', JSON.stringify(payload, null, 2));
    console.log('Payload type:', payload.type);
    
    // Handle button clicks (block_actions type)
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      console.log('✅ Button clicked!');
      console.log('Action ID:', action.action_id);
      console.log('Button value:', action.value);
      
      // Respond to Slack
      return NextResponse.json({
        text: `Button clicked! Action: ${action.action_id}`,
        replace_original: false
      });
    }
    
    // Handle view submissions (modal submissions)
    if (payload.type === 'view_submission') {
      console.log('📝 Modal submitted!');
      return NextResponse.json({ response_action: 'clear' });
    }
    
    // Handle shortcuts
    if (payload.type === 'shortcut') {
      console.log('⚡ Shortcut triggered!');
      return NextResponse.json({ ok: true });
    }
    
    // Default response for other types
    console.log('Unknown interaction type:', payload.type);
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('❌ Error processing Slack interaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// For Slack's verification challenge when you first set up the URL
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Slack interactivity endpoint is running!',
    timestamp: new Date().toISOString()
  });
}