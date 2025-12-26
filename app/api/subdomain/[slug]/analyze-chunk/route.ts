import { NextResponse } from 'next/server';
import OpenAI from 'openai'; // Moonshot is OpenAI-compatible

// Configure for Moonshot (or Groq/GPT-4o-mini)
const client = new OpenAI({
  apiKey: process.env.MOONSHOT_API_KEY, // Add this to .env
  baseURL: "https://api.moonshot.ai/v1", // Moonshot Endpoint
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    console.log("🧠 AI Endpoint received text:", text);

    if (!text || text.length < 10) return NextResponse.json({});

    const completion = await client.chat.completions.create({
      model: "moonshot-v1-8k", // Or "llama3-70b-8192" if using Groq
      messages: [
        {
          role: "system",
          content: "You are a construction estimator. Analyze the input sentence. If it contains a specific renovation task, repair, or paint color, extract it as a concise string. If it is just small talk, return null. Return JSON: { \"item\": \"string or null\" }."
        },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ item: null });
  }
}