import z from "zod";

export const intelligenceResultSchema = z.object({
  intelligence: z.object({
    callReason: z.string(),
    callSummary: z.string(),
    callOutcome: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
    lastInteraction: z.string(),
    projectScope: z.string().optional(),
    estimatedAdditionalValue: z.number().optional(),
    costBreakdown: z.string().optional(),
  }),
  transcriptText: z.string(),
  audioUrl: z.string().optional(),
});

export type IntelligenceResult = z.infer<typeof intelligenceResultSchema>;