// app/api/webhooks/slack/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleScheduleSMSFollowup } from '@/lib/slack/interactivity-handler/schedule-sms-followup-24h';
import { SlackInteraction } from '@/lib/slack/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const payloadString = formData.get('payload') as string;
    
    if (!payloadString) {
      return NextResponse.json({ error: 'No payload provided' }, { status: 400 });
    }
    
    const payload: SlackInteraction = JSON.parse(payloadString);
    
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      
      if (action.action_id === 'schedule_24h_sms') {
        const response = await handleScheduleSMSFollowup(payload);
        return NextResponse.json(response);
      }
    }
    
    return NextResponse.json({ 
      response_type: 'ephemeral',
      text: 'This interaction is not yet supported.' 
    });
    
  } catch (error) {
    console.error('❌ Error processing Slack interaction:', error);
    return NextResponse.json(
      { 
        response_type: 'ephemeral',
        text: 'Error processing your request.' 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Slack interactivity endpoint is running!',
    timestamp: new Date().toISOString()
  });
}