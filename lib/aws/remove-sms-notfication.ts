// lib/aws/remove-sms-notification.ts
const url = process.env.AWS_SMS_SCHEDULER_REMOVAL_URL;

export async function removeSmsNotification(sessionId: string) {
  try {
    const response = await fetch(url!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove SMS: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing SMS notification:', error);
    throw error;
  }
}