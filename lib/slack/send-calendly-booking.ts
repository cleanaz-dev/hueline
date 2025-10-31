import { SLACK_WEBHOOKS } from "../config/slack-webhook-urls";

type CalendlyEvent =
  | "invitee.created"
  | "invitee.canceled"
  | "invitee_no_show.created"
  | "invitee_no_show.deleted"
  | "routing_form_submission.created";

type CalendlyPayload = {
  event: CalendlyEvent;
  name: string;
  email: string;
  scheduled_event: {
    name: string;
    start_time: string;
    end_time: string;
    uri: string;
  };
  reschedule_url?: string;
  cancel_url?: string;
};

const STATUS_LABEL: Record<CalendlyEvent, string> = {
  "invitee.created": "Meeting booked",
  "invitee.canceled": "Meeting cancelled", 
  "invitee_no_show.created": "No-show marked",
  "invitee_no_show.deleted": "No-show removed",
  "routing_form_submission.created": "Routing form submitted",
};

function getColorForEvent(event: CalendlyEvent): string {
  const colors = {
    "invitee.created": "#36a64f",
    "invitee.canceled": "#ff0000",
    "invitee_no_show.created": "#ff8000",
    "invitee_no_show.deleted": "#00bfff",
    "routing_form_submission.created": "#8a2be2",
  };
  return colors[event] || "#757575";
}

export async function sendCalendlyBooking(payload: CalendlyPayload) {
  const webhookUrl = SLACK_WEBHOOKS.scheduled_meetings;
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured");
    return;
  }

  const { name, email, scheduled_event: evt, event } = payload;
  const start = new Date(evt.start_time);
  const end   = new Date(evt.end_time);

  const dateStr = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeStr = `${start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} – ${end.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;

  const status = STATUS_LABEL[event];

  const message = {
    attachments: [
      {
        color: getColorForEvent(event),
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `📅 Calendly – ${status}`,
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Name:*\n${name}` },
              { type: "mrkdwn", text: `*Email:*\n${email}` },
            ],
          },
          {
            type: "section", 
            fields: [
              { type: "mrkdwn", text: `*Event:*\n${evt.name}` },
              { type: "mrkdwn", text: `*Time:*\n${dateStr} ${timeStr}` },
            ],
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!res.ok) console.error("Slack webhook failed:", res.statusText);
  } catch (err) {
    console.error("Failed to send Slack notification:", err);
  }
}