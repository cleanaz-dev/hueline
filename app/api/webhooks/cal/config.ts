import twilio from "twilio";

export const EVENT_TYPES = {
  LANDING_PAGE: "5512331",
  DEMO_PAGE: "5313250",
} as const;

export const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);


export async function sendSmsConfirmation(
  to: string,
  name: string,
  title: string,
  formatted: string,
) {
  await client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER!,
    body: `Hi ${name}, your booking "${title}" is confirmed for ${formatted}. See you then!`,
  });
}
