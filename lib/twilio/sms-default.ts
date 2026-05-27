
import {twilioClient } from "./config";

interface SendSMSDefault {
  to: string;
  body: string;
}

export async function sendDefaultSMS({
  to,
  body,

}: SendSMSDefault) {
  // Fixed syntax: added closing parenthesis
  try {
    const message = await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    });

  

    return message;
  } catch (error) {
    console.error(`Error in SMS:`, error); // Removed undefined promptType variable
    throw error;
  }
}
