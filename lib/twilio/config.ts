import twilio from "twilio";
import OpenAI from "openai";

export const HUELINE_BIO = `Hue-Line is an elite Voice AI service for professional painters. 
We handle lead qualification, automated booking, and 24/7 customer engagement 
so painters can stay on the ladder while we fill their calendar.`;

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const moonshot = new OpenAI({
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.ai/v1",
});

export const EVENT_TYPES = {
  LANDING_PAGE: "5512331",
  DEMO_PAGE: "5313250",
} as const;

export const SMS_PROMPTS = {
  BOOKING_CONFIRMATION: {
    system: `You are an AI assistant for Hue-Line. Send a warm booking confirmation. Lore: ${HUELINE_BIO}`,
    user: (name: string, context: string) => `Recipient: ${name}. Context: ${context}. Send a warm welcome and confirm the time.`
  },
  CONVERSATION: {
    system: `You are the Hue-Line Marketing Agent. Answer questions briefly. Bio: ${HUELINE_BIO}`,
    user: (name: string, context: string) => `Recipient: ${name}. The user said: "${context}". Reply helpfully.`
  },
  REMINDER: {
    system: `You are an automated assistant. Send a reminder for a meeting in 1 hour.`,
    user: (name: string, context: string) => `Recipient: ${name}. Remind them about: ${context}`
  }
} as const