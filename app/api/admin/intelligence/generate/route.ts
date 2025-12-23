import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    console.log("Desc:", description);

    if (!description) {
      return NextResponse.json({ error: "Description required" }, { status: 400 });
    }

    const apiKey = process.env.ASSEMBLY_AI_KEY;
    if (!apiKey) {
      console.error("Missing ASSEMBLY_AI_KEY");
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const architectPrompt = `
    You are a System Architect. Convert raw business text into a structured JSON config.
    
    OUTPUT JSON STRUCTURE:
    {
      "summary": "Short explanation of the detected logic.",
      "prompt": "The system prompt for the AI. Use {{variable_name}} for numbers.",
      "values": { "variable_name": number }, 
      "schema": { "field_name": "type" }
    }

    MANDATORY SCHEMA FIELDS (You MUST include these exactly):
    - "projectScope": "INTERIOR | EXTERIOR | CABINETS | DECK_FENCE | UNKNOWN"
    - "propertyType": "RESIDENTIAL | COMMERCIAL | UNKNOWN"
    - "callReason": "NEW_PROJECT | STATUS_UPDATE | COLOR_CHANGE | PRICING | FOLLOW_UP | OTHER"

    RULES:
    1. Start the 'schema' with the MANDATORY FIELDS above.
    2. Add NEW schema fields based on the specific business text (e.g. if they mention 'cabinets', add 'include_cabinets': 'boolean').
    3. Extract ALL prices/numbers into 'values'.
    4. Use {{key}} in the 'prompt' instead of hardcoded numbers.
    `;

    console.log("Calling LLM Gateway...");

    const response = await fetch("https://llm-gateway.assemblyai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-3-pro-preview", 
        messages: [
          { role: "system", content: architectPrompt },
          { role: "user", content: `Business Description: ${description}` }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    console.log("LLM Response Status:", response.status);

    const data = await response.json();
    console.log("LLM Response Data:", JSON.stringify(data, null, 2));

    if (!response.ok || data.error) {
      console.error("LLM Gateway Failed:", JSON.stringify(data, null, 2));
      return NextResponse.json({ 
        error: "AI Service Unavailable",
        details: data.error || data
      }, { status: 500 });
    }

    let content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in response:", data);
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    console.log("Raw Content:", content);

    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(content);
    console.log("Parsed Result:", parsed);
    
    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}