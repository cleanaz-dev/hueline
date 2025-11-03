// lib/slack/interactivity-handler/schedule-sms-followup-24h.ts

import { SlackInteraction } from "../types";

interface SMSScheduleRequest {
  phone: string;
  body: string;
  media_url?: string;
  delay_hours?: number;
}

interface SMSScheduleResponse {
  success: boolean;
  scheduled_for: string;
  schedule_name: string;
  delay_hours: number;
  error?: string;
}

export async function handleScheduleSMSFollowup(interaction: SlackInteraction) {
  const action = interaction.actions[0];
  const values = JSON.parse(action.value) as { 
    customer_name: string; 
    customer_phone: string 
  };
  const { customer_name, customer_phone } = values;

  try {
    // 1. POST to your SMS scheduler Lambda
    const smsRequest: SMSScheduleRequest = {
      phone: customer_phone,
      body: `Hi ${customer_name}, thanks for visiting! Book a follow-up appointment here: ${process.env.CALENDLY_LINK}`,
      delay_hours: 24
    };

    const response = await fetch(process.env.SMS_SCHEDULER_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsRequest)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result: SMSScheduleResponse = await response.json();

    // 2. Update Slack message with success
    const updateMessage = {
      replace_original: true,
      blocks: [
        {
          type: "section" as const,
          text: {
            type: "mrkdwn" as const,
            text: `✅ *24h Follow-up SMS Scheduled*\n\n*Customer:* ${customer_name}\n*Phone:* ${customer_phone}\n*Scheduled for:* ${result.scheduled_for} UTC\n*Schedule ID:* \`${result.schedule_name}\``
          }
        },
        {
          type: "context" as const,
          elements: [
            {
              type: "mrkdwn" as const,
              text: `Message: "${smsRequest.body}"`
            }
          ]
        }
      ]
    };

    return updateMessage;

  } catch (error) {
    // 3. Handle errors and update Slack message
    console.error('Failed to schedule SMS:', error);
    
    const errorMessage = {
      replace_original: true,
      blocks: [
        {
          type: "section" as const,
          text: {
            type: "mrkdwn" as const,
            text: `❌ *Failed to Schedule SMS*\n\n*Customer:* ${customer_name}\n*Phone:* ${customer_phone}\n*Error:* ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
      ]
    };

    return errorMessage;
  }
}