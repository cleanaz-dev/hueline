export async function MakeHandler({
  company,
  customerName,
  customerEmail,
  phone,
  crm,
  stripeID,
  voiceAIInfo,
  plan,
}: {
  company: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  crm: string;
  stripeID: string;
  voiceAIInfo?: string;
  plan?: string;
}): Promise<{ project_url: string }> { // Add return type
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
        crm,
        stripeID,
        voiceAIInfo,
        plan,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('❌ Make webhook failed:', text);
      throw new Error(`Make webhook failed: ${res.status}`);
    }

    // Parse the JSON response from Make
    const result = await res.json();
    console.log(`✅ Sent client ${company} to Make, project URL: ${result.project_url}`);
    
    return result; // Return the parsed response

  } catch (err) {
    console.error('❌ Error sending to Make:', err);
    throw err; // Re-throw to handle in the calling function
  }
}