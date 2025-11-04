// app/api/webhooks/slack/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleScheduleSMSFollowup } from '@/lib/slack/interactivity-handler/schedule-sms-followup-24h';
import { SlackInteraction } from '@/lib/slack/types';

// export async function POST(req: NextRequest) {
//   const startTime = Date.now(); // ⏱️ Start timer
//   console.log('📥 Received Slack webhook request');
  
//   try {
//     const formData = await req.formData();
//     const payloadString = formData.get('payload') as string;
    
//     if (!payloadString) {
//       console.error('❌ No payload provided in request');
//       return NextResponse.json({ error: 'No payload provided' }, { status: 400 });
//     }
    
//     console.log('📦 Raw payload received:', payloadString.substring(0, 200) + '...');
    
//     const payload: SlackInteraction = JSON.parse(payloadString);
//     console.log('✅ Payload parsed successfully');
//     console.log('🔍 Interaction type:', payload.type);
//     console.log('👤 User:', payload.user?.username || payload.user?.id);
    
//     if (payload.type === 'block_actions') {
//       const action = payload.actions[0];
//       console.log('🎯 Action ID:', action.action_id);
//       console.log('📋 Action value:', action.value);
      
//       if (action.action_id === 'schedule_24h_sms') {
//         console.log('📅 Handling 24h SMS scheduling request');
        
//         const handlerStartTime = Date.now(); // ⏱️ Handler start
//         const responsePayload = await handleScheduleSMSFollowup(payload);
//         const handlerDuration = Date.now() - handlerStartTime; // ⏱️ Handler duration
        
//         console.log(`⏱️ Handler took ${handlerDuration}ms`);
//         console.log('✅ SMS scheduling handler completed successfully');

//         const totalDuration = Date.now() - startTime; // ⏱️ Total duration
//         console.log(`⏱️ TOTAL REQUEST DURATION: ${totalDuration}ms`);

//         // ✅ Send raw JSON so Slack properly updates the original message
//         return new Response(JSON.stringify(responsePayload), {
//           status: 200,
//           headers: { 'Content-Type': 'application/json' },
//         });
//       } else {
//         console.warn('⚠️ Unknown action_id:', action.action_id);
//       }
//     } else {
//       console.warn('⚠️ Unsupported interaction type:', payload.type);
//     }
    
//     return NextResponse.json({ 
//       response_type: 'ephemeral',
//       text: 'This interaction is not yet supported.' 
//     });
    
//   } catch (error) {
//     const totalDuration = Date.now() - startTime;
//     console.error(`⏱️ Request failed after ${totalDuration}ms`);
//     console.error('❌ Error processing Slack interaction:', error);
//     console.error('❌ Error details:', {
//       name: error instanceof Error ? error.name : 'Unknown',
//       message: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined
//     });
    
//     return NextResponse.json(
//       { 
//         response_type: 'ephemeral',
//         text: 'Error processing your request.' 
//       },
//       { status: 500 }
//     );
//   }
// }


export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('📥 Received Slack webhook request');
  
  try {
    const formData = await req.formData();
    const payloadString = formData.get('payload') as string;
    
    if (!payloadString) {
      console.error('❌ No payload provided in request');
      return NextResponse.json({ error: 'No payload provided' }, { status: 400 });
    }
    
    const payload: SlackInteraction = JSON.parse(payloadString);
    console.log('✅ Payload parsed successfully');
    
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      
      if (action.action_id === 'schedule_24h_sms') {
        console.log('📅 Handling 24h SMS scheduling request');
        
        const handlerStartTime = Date.now();
        const responsePayload = await handleScheduleSMSFollowup(payload);
        const handlerDuration = Date.now() - handlerStartTime;
        
        console.log(`⏱️ Handler took ${handlerDuration}ms`);
        
        // 🔥 POST TO RESPONSE_URL TO UPDATE THE MESSAGE
        const updateStartTime = Date.now();
        await fetch(payload.response_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(responsePayload)
        });
        console.log(`⏱️ Message update took ${Date.now() - updateStartTime}ms`);
        
        const totalDuration = Date.now() - startTime;
        console.log(`⏱️ TOTAL REQUEST DURATION: ${totalDuration}ms`);

        // Return 200 OK to Slack
        return new Response('', { status: 200 });
      }
    }
    
    return new Response('', { status: 200 });
    
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`⏱️ Request failed after ${totalDuration}ms`);
    console.error('❌ Error:', error);
    
    return new Response('', { status: 500 });
  }
}