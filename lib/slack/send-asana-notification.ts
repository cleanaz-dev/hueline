import { SLACK_WEBHOOKS } from "../config/slack-webhook-urls";

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
