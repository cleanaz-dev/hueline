import z from "zod";

export const intelligenceResultSchema = z.object({
  intelligence: z.object({
    callReason: z.string(),
    callSummary: z.string(),
    callOutcome: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]), // Matches LLM prompt instructions
    lastInteraction: z.string(),
  }),
  transcriptText: z.string()
});


export type IntelligenceResult = z.infer<typeof intelligenceResultSchema>
