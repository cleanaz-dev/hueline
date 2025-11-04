// app/api/webhooks/slack/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleScheduleSMSFollowup } from '@/lib/slack/interactivity-handler/schedule-sms-followup-24h';
import { SlackInteraction } from '@/lib/slack/types';

export async function POST(req: NextRequest) {
  console.log('📥 Received Slack webhook request');
  
  try {
    const formData = await req.formData();
    const payloadString = formData.get('payload') as string;
    
    if (!payloadString) {
      console.error('❌ No payload provided in request');
      return NextResponse.json({ error: 'No payload provided' }, { status: 400 });
    }
    
    console.log('📦 Raw payload received:', payloadString.substring(0, 200) + '...');
    
    const payload: SlackInteraction = JSON.parse(payloadString);
    console.log('✅ Payload parsed successfully');
    console.log('🔍 Interaction type:', payload.type);
    console.log('👤 User:', payload.user?.username || payload.user?.id);
    
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      console.log('🎯 Action ID:', action.action_id);
      console.log('📋 Action value:', action.value);
      
      if (action.action_id === 'schedule_24h_sms') {
        console.log('📅 Handling 24h SMS scheduling request');
        const responsePayload = await handleScheduleSMSFollowup(payload);
        console.log('✅ SMS scheduling handler completed successfully');

        // ✅ Send raw JSON so Slack properly updates the original message
        return new Response(JSON.stringify(responsePayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        console.warn('⚠️ Unknown action_id:', action.action_id);
      }
    } else {
      console.warn('⚠️ Unsupported interaction type:', payload.type);
    }
    
    return NextResponse.json({ 
      response_type: 'ephemeral',
      text: 'This interaction is not yet supported.' 
    });
    
  } catch (error) {
    console.error('❌ Error processing Slack interaction:', error);
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        response_type: 'ephemeral',
        text: 'Error processing your request.' 
      },
      { status: 500 }
    );
  }
}
