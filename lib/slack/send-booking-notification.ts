// lib/slack.ts
import { SLACK_WEBHOOKS } from "../config/slack-webhook-urls";

// WHEN SOMEONE USES DEMO
export async function sendBookingNotification(booking: {
  name: string;
  phone?: string;
}) {
  const webhookUrl = SLACK_WEBHOOKS.demo_radar;
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured");
    return;
  }

  const message = {
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
            text: `*Phone:*\n${booking.phone || "N/A"}`,
          },
        ],
      },
    ],
  };

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