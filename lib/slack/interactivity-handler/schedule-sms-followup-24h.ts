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

// export async function handleScheduleSMSFollowup(interaction: SlackInteraction) {
//   const action = interaction.actions[0];
//   const values = JSON.parse(action.value) as { 
//     customer_name: string; 
//     customer_phone: string 
//   };
//   const { customer_name, customer_phone } = values;

//   console.log(`📱 Scheduling SMS for ${customer_name} (${customer_phone})`);

//   try {
//     // 1. POST to your SMS scheduler Lambda
//     const smsRequest: SMSScheduleRequest = {
//       phone: customer_phone,
//       body: `Hi ${customer_name}, thanks for visiting! Book a follow-up appointment here: ${process.env.CALENDLY_LINK}`,
//       delay_hours: 24
//     };

//     console.log(`🚀 Posting to Lambda: ${process.env.SMS_SCHEDULER_URL}`);

//     const response = await fetch(process.env.SMS_SCHEDULER_URL!, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(smsRequest)
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error(`❌ Lambda error: ${response.status}`, errorData);
//       throw new Error(errorData.error || `HTTP ${response.status}`);
//     }

//     const result: SMSScheduleResponse = await response.json();
//     console.log(`✅ SMS scheduled: ${result.schedule_name}`);

//     // 2. Update Slack message with success (keep original booking info too)
//     const updateMessage = {
//       replace_original: true,
//       blocks: [
//         {
//           type: "header" as const,
//           text: {
//             type: "plain_text" as const,
//             text: "🎨 New Booking",
//             emoji: true,
//           },
//         },
//         {
//           type: "section" as const,
//           fields: [
//             {
//               type: "mrkdwn" as const,
//               text: `*Name:*\n${customer_name}`,
//             },
//             {
//               type: "mrkdwn" as const,
//               text: `*Phone:*\n${customer_phone}`,
//             },
//           ],
//         },
//         {
//           type: "section" as const,
//           text: {
//             type: "mrkdwn" as const,
//             text: `✅ *24h Follow-up SMS Scheduled*\n*Scheduled for:* ${result.scheduled_for} UTC\n*Schedule ID:* \`${result.schedule_name}\``
//           }
//         },
//         {
//           type: "context" as const,
//           elements: [
//             {
//               type: "mrkdwn" as const,
//               text: `📱 Message: "${smsRequest.body}"`
//             }
//           ]
//         }
//       ]
//     };

//     return updateMessage;

//   } catch (error) {
//     console.error('❌ Failed to schedule SMS:', error);
    
//     const errorMessage = {
//       replace_original: true,
//       blocks: [
//         {
//           type: "header" as const,
//           text: {
//             type: "plain_text" as const,
//             text: "🎨 New Booking",
//             emoji: true,
//           },
//         },
//         {
//           type: "section" as const,
//           fields: [
//             {
//               type: "mrkdwn" as const,
//               text: `*Name:*\n${customer_name}`,
//             },
//             {
//               type: "mrkdwn" as const,
//               text: `*Phone:*\n${customer_phone}`,
//             },
//           ],
//         },
//         {
//           type: "section" as const,
//           text: {
//             type: "mrkdwn" as const,
//             text: `❌ *Failed to Schedule SMS*\n*Error:* ${error instanceof Error ? error.message : 'Unknown error'}`
//           }
//         }
//       ]
//     };

//     return errorMessage;
//   }
// }

// lib/slack/interactivity-handler/schedule-sms-followup-24h.ts

// Utility function to handle unknown error types safely
const getErrorMessage = (e: unknown): string => {
    return (e instanceof Error) ? e.message : String(e);
};

export async function handleScheduleSMSFollowup(interaction: SlackInteraction) {
  const action = interaction.actions[0];
  const values = JSON.parse(action.value) as { 
    customer_name: string; 
    customer_phone: string 
  };
  const { customer_name, customer_phone } = values;

  console.log(`📱 Scheduling SMS for ${customer_name} (${customer_phone})`);

  try {
    // 1. POST to your SMS scheduler Lambda
    const smsRequest: SMSScheduleRequest = {
      phone: customer_phone,
      body: `Hi ${customer_name}, thanks for visiting Hue-Line! Book a follow-up appointment here: ${process.env.CALENDLY_LINK}. Reply STOP to opt out.`,
      delay_hours: 24
    };

    console.log(`🚀 Posting to Lambda: ${process.env.SMS_SCHEDULER_URL}`);

    const response = await fetch(process.env.SMS_SCHEDULER_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsRequest)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ Lambda error: ${response.status}`, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result: SMSScheduleResponse = await response.json();
    console.log(`✅ SMS scheduled: ${result.schedule_name}`);

    // Determine who clicked the button
    const actionedByUserId = interaction.user?.id;
    const actionedByUserText = actionedByUserId ? `<@${actionedByUserId}>` : 'An unknown user';

    // 2. Update Slack message with success (keep original booking info too)
    const updateMessage = {
      replace_original: true, // Key property to update the original message
      blocks: [
        {
          type: "header" as const,
          text: {
            type: "plain_text" as const,
            text: "🎨 New Booking",
            emoji: true,
          },
        },
        {
          type: "section" as const,
          fields: [
            {
              type: "mrkdwn" as const,
              text: `*Name:*\n${customer_name}`,
            },
            {
              type: "mrkdwn" as const,
              text: `*Phone:*\n${customer_phone}`,
            },
          ],
        },
        {
          type: "section" as const,
          text: {
            type: "mrkdwn" as const,
            text: `✅ *24h Follow-up SMS Scheduled*\n*Scheduled for:* ${result.scheduled_for} UTC\n*Schedule ID:* \`${result.schedule_name}\``
          }
        },
        // {
        //   type: "context" as const,
        //   elements: [
        //     {
        //       type: "mrkdwn" as const,
        //       text: `📱 Message: "${smsRequest.body}"`
        //     }
        //   ]
        // },
        {
            type: "context" as const,
            elements: [
                {
                    type: "mrkdwn" as const,
                    text: `Actioned by ${actionedByUserText}`
                }
            ]
        }
      ]
    };

    return updateMessage;

  } catch (error) {
    console.error('❌ Failed to schedule SMS:', error);
    
    const errorMessage = {
      replace_original: true, // Key property to update the original message
      blocks: [
        {
          type: "header" as const,
          text: {
            type: "plain_text" as const,
            text: "🎨 New Booking",
            emoji: true,
          },
        },
        {
          type: "section" as const,
          fields: [
            {
              type: "mrkdwn" as const,
              text: `*Name:*\n${customer_name}`,
            },
            {
              type: "mrkdwn" as const,
              text: `*Phone:*\n${customer_phone}`,
            },
          ],
        },
        {
          type: "section" as const,
          text: {
            type: "mrkdwn" as const,
            text: `❌ *Failed to Schedule SMS*\n*Error:* ${getErrorMessage(error)}`
          }
        }
        // You could add the original button back here in the error case if you want users to retry
      ]
    };

    return errorMessage;
  }
}