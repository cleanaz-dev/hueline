// lib/config/slack-webhook-urls

export const SLACK_WEBHOOKS = {
  demo_radar: process.env.SLACK_WEBHOOK_DEMO,
  scheduled_meetings: process.env.SLACK_WEBHOOK_MEETING,
  payments: process.env.SLACK_WEBHOOK_PAYMENT,
  projects: process.env.SLACK_WEBHOOK_PROJECT,
} as const;
