// lib/slack/send-booking-notification.ts
import { SLACK_WEBHOOKS } from "../config/slack-webhook-urls";

type SlackBlock = 
  | {
      type: "header";
      text: {
        type: "plain_text";
        text: string;
        emoji: boolean;
      };
    }
  | {
      type: "section";
      fields: Array<{
        type: "mrkdwn";
        text: string;
      }>;
    }
  | {
      type: "actions";
      elements: Array<{
        type: "button";
        text: {
          type: "plain_text";
          text: string;
          emoji: boolean;
        };
        style?: string;
        action_id: string;
        value: string;
      }>;
    };

export async function sendBookingNotification(booking: {
  name: string;
  phone?: string;
}) {
  const webhookUrl = SLACK_WEBHOOKS.demo_radar;
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured");
    return;
  }


  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🎨 New Booking",
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Name:*\n${booking.name}`,
        },
        {
          type: "mrkdwn",
          text: `*Phone:*\n${booking.phone || "No phone provided"}`,
        },
      ],
    },
  ];


  const message = { blocks };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error("Slack webhook failed:", response.statusText);
    }
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}