import { z } from "zod"

export const callWebhookBodySchema = z.object({
    recording_url: z.string(),
    status: z.literal("completed"),
    transcript_text: z.string(),
    action: z.literal("CALL_INTELLIGENCE"),
    
    // 👇 Change z.object({ ... }).passthrough() to z.looseObject({ ... })
    intelligence: z.looseObject({
        callReason: z.string().optional(),
        projectScope: z.string().optional(),
        callSummary: z.string().optional(),
        callOutcome: z.string().optional(),
        lastInteraction: z.string().optional(),
        estimatedAdditionalValue: z.coerce.number().optional(), 
        costBreakdown: z.string().optional(),
    })
})

export type CallWebhookBody = z.infer<typeof callWebhookBodySchema>