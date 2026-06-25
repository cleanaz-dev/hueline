export interface PaintColorData {
  brand: string;
  name: string;
  code: string;
}

export async function paintColorMsgGenerator(
  draftBody: string,
  colorData: PaintColorData,
  deliveryMethod: "SMS" | "EMAIL" | "NONE" | string
): Promise<string> {
  const apiKey = process.env.NOVITA_API_KEY;
  const colorString = `${colorData.brand} ${colorData.name} (${colorData.code})`;

  // If there's no API key or it's NONE, just append it manually and move on safely.
  if (!apiKey || deliveryMethod === "NONE") {
    return `${draftBody} (Color: ${colorString})`;
  }

  const lengthRule =
    deliveryMethod === "SMS"
      ? "- Keep the message strictly under 160 characters. Conversational and punchy."
      : "- You are writing for an EMAIL body, keep it professional but warm.";

  const prompt = `You are an elite sales assistant for a painting company.
You just generated a room mockup for a customer.
Drafted intent message: "${draftBody}"
Actual paint color used: "${colorString}"

Rewrite the drafted message to naturally include the exact paint color name.
STRICT RULES:
- Keep the original tone and intent.
- Ensure it sounds like the image is attached right now (e.g., "Here is the [color] mockup...").
${lengthRule}
- Return ONLY the raw final message text. No quotes, no markdown, no explanation.`;

  try {
    const response = await fetch("https://api.novita.ai/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000

      }),
    });

    if (!response.ok) {
      throw new Error(`Novita API error: ${response.status}`);
    }

    const data = await response.json();
    let finalMessage = data.choices[0].message.content.trim();

    // Clean up random quotes AI sometimes adds
    finalMessage = finalMessage.replace(/^["']|["']$/g, "").trim();

    return finalMessage;
  } catch (error) {
    console.error("[paintColorMsgGenerator] Failed, falling back:", error);
    return `${draftBody} (Color: ${colorString})`;
  }
}