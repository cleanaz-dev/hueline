import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;

  if (!slug)
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  try {
    const { transcripts } = await req.json();

    // 1. Prepare the dialogue for the LLM
    const conversation = transcripts
      .map(
        (t: any) =>
          `${t.sender === "local" ? "Painter" : "Homeowner"}: ${t.text}`
      )
      .join("\n");

    // 2. Send to AssemblyAI LLM Gateway
    const response = await fetch(
      "https://llm-gateway.assemblyai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY!,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5.2", // Using the robust model from your docs
          messages: [
            {
              role: "system",
              content:
                "You are a professional painting estimator. Read the conversation and extract a precise 'Scope of Work' list. Ignore small talk. Return a JSON object with a single key 'items' which is an array of strings.",
            },
            { role: "user", content: conversation },
          ],
          max_tokens: 1000,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // 3. Clean and Parse the JSON response
    // LLMs sometimes wrap JSON in markdown (```json ... ```), so we clean it.
    let content = data.choices[0].message.content;
    content = content.replace(/```json|```/g, "").trim();

    return NextResponse.json(JSON.parse(content));
  } catch (error: any) {
    console.error("Scope Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze" },
      { status: 500 }
    );
  }
}
