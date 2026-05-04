import { twilioClient } from "./config";

interface SMSProps {
  to: string;
  body: string;
  imageUrl: string[];
}

export async function SendImageSMS({ to, body, imageUrl }: SMSProps) {
  try {
    const message = await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
      mediaUrl: imageUrl,
    });
    return message;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
