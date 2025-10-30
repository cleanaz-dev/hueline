import { SLACK_WEBHOOKS } from "../config/slack-webhook-urls";

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