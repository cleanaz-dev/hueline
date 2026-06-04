import z from "zod";

export const hueclawCommsMetadataSchema = z.object({
    threadId: z.string(),
    trigger: z.enum(['comms','imagen', 'quote'])
})

export type HueclawCommsMetadata = z.infer<typeof hueclawCommsMetadataSchema>