// lib/slack.ts
import { SLACK_WEBHOOKS } from "./config/slack-webhook-urls";

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

// WHEN CALENDLY IS BOOKED
export async function sendCalendlyBooking(booking: {
  name: string;
  email: string;
  eventType: string;
  scheduledTime: string;
}) {
  const webhookUrl = SLACK_WEBHOOKS.scheduled_meetings;
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
          text: "📅 Calendly Booking",
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
            text: `*Email:*\n${booking.email}`,
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Event:*\n${booking.eventType}`,
          },
          {
            type: "mrkdwn",
            text: `*Time:*\n${booking.scheduledTime}`,
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

// When one time payment is received
export async function sendPaymentNotification(payment: {
  name: string;
  email: string;
  company: string;
  amount: number; // IN CENTS FROM STRIPE
  currency: string;
  planType: string;
}) {
  const webhookUrl = SLACK_WEBHOOKS.payments;

  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOKS.payments not configured");
    return;
  }

  // FORMAT THE FUCKING PRICE IN ONE SPOT
  const dollars = payment.amount / 100;
  const formattedAmount = dollars.toLocaleString("en-CA", {
    style: "currency",
    currency: payment.currency.toUpperCase(),
  });

  const message = {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "💰 Payment Received", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Client:*\n${payment.name}` },
          { type: "mrkdwn", text: `*Company:*\n${payment.company}` },
        ],
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Amount:*\n${formattedAmount}` }, // $1,000.00
          { type: "mrkdwn", text: `*Plan:*\n${payment.planType}` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Email:*\n${payment.email}` },
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
      console.error("Slack payment notification failed:", response.statusText);
    }
  } catch (error) {
    console.error("Failed to send payment notification:", error);
  }
}

export async function sendProjectNotification(project: {
  project_url: string;
  company: string;
  name: string;
  phone: string;
  email: string;
  crm: string;
  download_url: string;
  s3_key: string;
}) {
  const webhookUrl = SLACK_WEBHOOKS.projects;

  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOKS.payments not configured");
    return;
  }

  const slackMessage = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚀 Project Setup Complete",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Company:*\n${project.company}`,
          },
          {
            type: "mrkdwn",
            text: `*Contact:*\n${project.name}`,
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Phone:*\n${project.phone}`,
          },
          {
            type: "mrkdwn",
            text: `*Email:*\n${project.email}`,
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*CRM Platform:*\n${project.crm}`, // ← Added CRM here
          },
          {
            type: "mrkdwn",
            text: `*Asana Project:*\n<${project.project_url}|View Project>`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Code Template:*\n<${project.download_url}|Download Template>`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `S3: ${project.s3_key}`,
          },
        ],
      },
      {
        type: "divider",
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
    throw error;
  }
}
