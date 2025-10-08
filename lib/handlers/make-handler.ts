// lib/handlers/make-handler.ts
export async function MakeHandler({
  company,
  customerName,
  customerEmail,
  phone,
  stripeID,
  voiceAIInfo,
  plan,
}: {
  company: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  stripeID: string;
  voiceAIInfo?: string;
  plan?: string;
}) {
  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL!;
  
  try {
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company,
        customerName,
        customerEmail,
        phone,
        stripeID,
        voiceAIInfo,
        plan,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('❌ Make webhook failed:', text);
    } else {
      console.log(`✅ Sent client ${company} to Make`);
    }
  } catch (err) {
    console.error('❌ Error sending to Make:', err);
  }
}
