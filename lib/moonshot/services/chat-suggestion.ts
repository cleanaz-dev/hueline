// lib/moonshot/services/chat-suggestion.ts
import { z } from "zod";
import { moonshot } from "../config";

// ── 1. Define the schema once — shared with frontend via export ──────────────
export const AiSuggestionSchema = z.object({
  thinking:        z.string(),
  decision:        z.string(),
  contactRequired: z.boolean(),
  suggestedSms:    z.string(),
  suggestedEmail: z.object({
    subject: z.string(),
    body:    z.string(),
  }),
});

export type AiSuggestionData = z.infer<typeof AiSuggestionSchema>;

interface AiSuggestionPayload {
  clientName?:    string;
  clientStatus?:  string;
  recentMessages: { role: string; type: string; body: string }[];
}

// ── 2. Single attempt ────────────────────────────────────────────────────────
async function attempt(data: AiSuggestionPayload): Promise<AiSuggestionData> {
  const chatHistoryContext = JSON.stringify(data.recentMessages, null, 2);

  const systemPrompt = `You are a Sales Customer Rep for a Painting SaaS. Analyze the communication log and return ONLY a raw JSON object — no markdown, no backticks, no explanation.

Current Client Status: ${data.clientStatus ?? "UNKNOWN"}
Recent Communication Log:
${chatHistoryContext}

You MUST respond with this exact JSON shape and nothing else:
{
  "thinking": "brief internal reasoning",
  "decision": "exact action to take",
  "contactRequired": true,
  "suggestedSms": "Hey [Name], ...",
  "suggestedEmail": {
    "subject": "...",
    "body": "..."
  }
}

If contactRequired is false, omit suggestedSms and suggestedEmail entirely.`;

  const response = await moonshot.chat.completions.create({
    model: "kimi-k2-thinking-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: `Analyze the thread for ${data.clientName ?? "this client"} and return your JSON response.` },
    ],
    max_completion_tokens: 4000,
    temperature: 1,
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? "";
  console.log("🤖 Raw AI response:", raw);

  // Strip markdown fences if the model wraps anyway
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/,"").trim();

  const parsed = JSON.parse(cleaned);          // throws → triggers retry
  return AiSuggestionSchema.parse(parsed);     // throws → triggers retry
}

// ── 3. Retry wrapper (3 attempts) ────────────────────────────────────────────
export async function aiChatSuggestion(
  data: AiSuggestionPayload,
  maxRetries = 3,
): Promise<AiSuggestionData> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await attempt(data);
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ AI attempt ${i + 1} failed:`, err);
    }
  }

  throw new Error(`AI suggestion failed after ${maxRetries} attempts: ${lastError}`);
}