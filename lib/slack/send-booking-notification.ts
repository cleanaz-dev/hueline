// lib/slack/send-booking-notification.ts
import { SLACK_WEBHOOKS } from "../config/slack-webhook-urls";

export async function sendBookingNotification(booking: {
  name: string;
  phone?: string;
}) {
  const webhookUrl = SLACK_WEBHOOKS.demo_radar;
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured");
    return;
  }

  // Only show button if we have a phone number
  const hasPhone = booking.phone && booking.phone.length > 0;

  const message: any = {
    blocks: [
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
    ],
  };

  // Add action buttons only if we have a phone number
  if (hasPhone) {
    message.blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "📅 Send Calendly Link in 24h",
            emoji: true,
          },
          style: "primary",
          action_id: "schedule_24h_sms",
          value: JSON.stringify({
            customer_name: booking.name,
            customer_phone: booking.phone,
            booking_type: "demo"
          })
        }
      ]
    });
  }

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