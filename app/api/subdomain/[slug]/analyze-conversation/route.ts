import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { transcripts } = await req.json();

    // 1. Format the conversation for the LLM
    const conversation = transcripts
      .map((t: any) => `${t.sender === 'local' ? 'Painter' : 'Homeowner'}: ${t.text}`)
      .join('\n');

    // 2. Call AssemblyAI LLM Gateway
    const response = await fetch("https://llm-gateway.assemblyai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "authorization": process.env.ASSEMBLYAI_AI_KEY!, // Using your existing key
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.2", // Using the model from your docs
        messages: [
          {
            role: "system",
            content: "You are a professional painting estimator. Read the conversation and extract a precise 'Scope of Work' list. Ignore small talk. You must output valid JSON only. Return a JSON object with a single key 'items' which is an array of strings."
          },
          { role: "user", content: conversation }
        ],
        // Some gateways support response_format for GPT models, 
        // but robust prompting (above) is safer for a unified gateway.
        max_tokens: 1000
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("AssemblyAI Gateway Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    // 3. Parse the result (The Gateway returns a standard OpenAI-like response structure)
    const content = data.choices[0].message.content;
    
    // Clean code blocks if the model adds markdown formatting like ```json ... ```
    const cleanJson = content.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanJson);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Analysis Failed:", error);
    return NextResponse.json({ error: 'Failed to analyze conversation' }, { status: 500 });
  }
}