import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    console.log("Input Text:", description?.slice(0, 100) + "...");

    if (!description) {
      return NextResponse.json({ error: "Description required" }, { status: 400 });
    }

    const apiKey = process.env.ASSEMBLY_AI_KEY;
    if (!apiKey) {
      console.error("Missing ASSEMBLY_AI_KEY");
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const architectPrompt = `
    You are a Pricing Engine Architect. 
    Your goal is to parse raw business text (price sheets, rules, conversations) into a structured JSON configuration for a pricing engine.

    --- OUTPUT JSON STRUCTURE ---
    {
      "summary": "Short explanation of the extracted pricing model.",
      "prompt": "The calculation logic instructions for the AI. Reference variables using {{key}}.",
      "values": { 
        "variable_key": { 
           "value": number, 
           "type": "FEE" | "MULTIPLIER",
           "label": "Human Readable Label" 
        } 
      }, 
      "schema": { "field_name": "type" }
    }

    --- CRITICAL RULES FOR 'values' OBJECT ---
    You must convert every number you find into a rich object.
    
    1. FEES ($): Costs, flat rates, hourly rates, or base prices.
       - TYPE: "FEE"
       - KEY NAMING: Must end in '_fee' or '_rate'. (e.g., 'travel_fee', 'hourly_rate')
       - VALUE: The raw number (e.g., 50).
    
    2. MULTIPLIERS (x): Percentages, markups, factors, or tax rates.
       - TYPE: "MULTIPLIER"
       - KEY NAMING: Must end in '_multiplier' or '_factor'. (e.g., 'high_end_multiplier', 'tax_factor')
       - VALUE: The mathematical factor (e.g., 20% becomes 0.2, "add 10%" becomes 0.1, "1.5x" becomes 1.5).
    
    3. LABEL: Create a clean, Title Case label for the UI (e.g., "Wood Rot Repair", "High Ceiling Markup").

    --- MANDATORY SCHEMA FIELDS ---
    Include these exactly in the 'schema' object:
    - "projectScope": "INTERIOR | EXTERIOR | CABINETS | DECK_FENCE | UNKNOWN"
    - "propertyType": "RESIDENTIAL | COMMERCIAL | UNKNOWN"
    - "callReason": "NEW_PROJECT | STATUS_UPDATE | COLOR_CHANGE | PRICING | FOLLOW_UP | OTHER"

    --- INSTRUCTIONS ---
    1. Parse the input text to find every cost, rate, or logic flag.
    2. If the text mentions a condition (e.g., "If older than 1978..."), add a boolean flag to 'schema' (e.g., "is_pre_1978": "boolean").
    3. Extract all numbers into the 'values' object using the rich structure defined above.
    4. Write a 'prompt' that explains step-by-step how to use these {{keys}} to calculate a final price.
    `;

    console.log("Calling LLM Gateway...");

    const response = await fetch("https://llm-gateway.assemblyai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash", // Use a smart model to handle the JSON structure reliably
        messages: [
          { role: "system", content: architectPrompt },
          { role: "user", content: `Here is the pricing document / business description:\n\n${description}` }
        ],
        temperature: 0.1,
        max_tokens: 3500
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error("LLM Gateway Failed:", JSON.stringify(data, null, 2));
      return NextResponse.json({ 
        error: "AI Service Unavailable",
        details: data.error || data
      }, { status: 500 });
    }

    let content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    // Clean Markdown wrappers if present
    content = content.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
    
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}