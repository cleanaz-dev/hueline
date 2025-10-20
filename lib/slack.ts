export async function sendBookingNotification(booking: {
  bookingId: string;
  name: string;
  phone?: string;
  prompt: string;
  mockup_urls: string[];
  paint_colors?: Array<{ name: string; hex: string }>;
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured");
    return;
  }

  const mainColor = booking.paint_colors?.[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎨 New Booking Created!",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Customer:*\n${booking.name}`,
          },
          {
            type: "mrkdwn",
            text: `*Phone:*\n${booking.phone || "N/A"}`,
          },
          {
            type: "mrkdwn",
            text: `*Booking ID:*\n\`${booking.bookingId}\``,
          },
          {
            type: "mrkdwn",
            text: `*Mockups:*\n${booking.mockup_urls.length} generated`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Project Vision:*\n"${booking.prompt.substring(0, 200)}${booking.prompt.length > 200 ? "..." : ""}"`,
        },
      },
      ...(mainColor
        ? [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Primary Color:* ${mainColor.name} (${mainColor.hex})`,
              },
            },
          ]
        : []),
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Booking 👀",
              emoji: true,
            },
            url: `${appUrl}/booking/${booking.bookingId}`,
            style: "primary",
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
