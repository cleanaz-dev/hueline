import { z } from "zod"

export const upscaleWebhookBodySchema = z.object({
    status: z.string(),
    s3Key: z.string(),
    completedAt: z.date(),
    action: z.literal("CLIENT_UPSCALE"),
    size: z.number()
})


export type UpscaleLambdaWebhookBody = z.infer< typeof upscaleWebhookBodySchema>