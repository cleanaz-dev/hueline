// lib/aws/send-sms-notification.ts

import { SmsData } from "./types";

export async function sendSmsNotification(data: SmsData) {
  try {
    const response = await fetch(process.env.AWS_SMS_SCHEDULER_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: data.phone,
        body: `Hi ${data.name}, thanks for visiting Hue-Line! Book your consultaion today: ${process.env.CALENDLY_LINK}. Reply STOP to opt out.`,
        delay_hours: 24,
        session_id: data.sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to schedule SMS: ${response.status}`);
    }

    console.log(`✅ SMS scheduled for session: ${data.sessionId}`);
  } catch (error) {
    console.error('❌ Failed to schedule SMS:', error);
    throw error;
  }
}