import { Prisma } from "@/app/generated/prisma"
import { novitaAI, LLM_MODELS } from "../novita"

interface ExampleProps {
    priceBook: Prisma.JsonValue
    contextFlags: Prisma.JsonValue
}

export async function getIntelligenceExamples({ priceBook, contextFlags }: ExampleProps) {
    const res = await novitaAI.chat.completions.create({
        model: LLM_MODELS.DEEPSEEK_V4_PRO,
        messages: [
            {
                role: "system",
                content: `You are an expert pricing intelligence and context extraction assistant for home service contractors. You strictly follow mathematical instructions and output exactly in JSON format.`
            },
            {
                role: "user",
                content: `Generate AI logic examples based on the user's specific configuration.

AVAILABLE PRICE BOOK:
${JSON.stringify(priceBook, null, 2)}

AVAILABLE CONTEXT FLAGS:
${JSON.stringify(contextFlags, null, 2)}

REQUIREMENTS:
Return a JSON object containing exactly two arrays: "examples" and "roomExamples".

1. "examples" Array (Generate 2-3 items):
This tests pricing logic and context listening.
- "input": A natural, conversational customer quote. It MUST imply specific quantities (for unit costs) and naturally suggest context flags (without explicitly saying the flag name).
- "flags": Array of strings. CRITICAL: You may ONLY use exact flags from the AVAILABLE CONTEXT FLAGS list. Do not invent any flags. If none apply, return [].
- "output": A mathematically accurate receipt.
  - Select 1-3 items from the AVAILABLE PRICE BOOK.
  - "lineItems": Array of { "name": string, "amount": number }. 
    - The "name" MUST include the item name AND the math formula in parentheses (e.g., "Standard Paint (3 units @ $150.00)" or "High Ceiling Premium (x 1.2 Multiplier)").
    - The "amount" MUST be mathematically correct.
  - "total": The exact mathematical sum of all line item amounts.

2. "roomExamples" Array (Generate 4-6 items):
This tests speech-to-scope conversion and noise filtering during a walkthrough. (Does not need to use the price book).
- "input": Short, colloquial snippets from a homeowner (e.g., "There's a weird soft spot on the wall behind the door", or "We use this room as a home office").
- "output": 
  - If the input requires physical work/repair: Return an object with professional taxonomy -> { "category": "Trade (e.g. Drywall, Plumbing)", "item": "Specific component", "action": "Professional action (e.g., Remove and replace)" }.
  - CRITICAL: At least 1 or 2 examples MUST return null for the output to demonstrate filtering out casual, non-actionable conversation (e.g., commenting on a rug or furniture).

RETURN EXACTLY THIS JSON STRUCTURE:
{
  "examples": [
    {
      "input": "string",
      "flags": ["string"],
      "output": {
        "lineItems": [{ "name": "string (math)", "amount": 0 }],
        "total": 0
      }
    }
  ],
  "roomExamples": [
    {
      "input": "string",
      "output": { "category": "string", "item": "string", "action": "string" } // OR null
    }
  ]
}`
            }
        ],
        max_completion_tokens: 10000,
        response_format: { type: "json_object" }
    })

    const content = res.choices[0]?.message?.content
    if (!content) throw new Error("No response from AI")

    const parsed = JSON.parse(content)
    return {
        examples: parsed.examples || [],
        roomExamples: parsed.roomExamples || [],
    }
}