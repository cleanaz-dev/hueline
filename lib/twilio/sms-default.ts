import { prisma } from "@/lib/prisma";
import { moonshot, twilioClient } from "./config";

interface SendSMSDefault {
  to: string;
  recipientName: string;
  body: string;
  customerId: string; // Added missing field
}

export async function sendDefaultSMS({
  to,
  recipientName,
  body,
  customerId, // Added missing parameter
}: SendSMSDefault) {
  // Fixed syntax: added closing parenthesis
  try {
    const message = await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    });

    await prisma.clientCommunication.create({
      data: {
        body,
        role: "OPERATOR", // You might want to set a proper role here
        type: "SMS",
        customerId,
      },
    });

    return message;
  } catch (error) {
    console.error(`Error in SMS:`, error); // Removed undefined promptType variable
    throw error;
  }
}
