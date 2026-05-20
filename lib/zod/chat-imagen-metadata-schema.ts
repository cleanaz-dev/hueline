import { z } from "zod"

export const chatImagenMetadataSchema = z.object({
    brand: z.string(),
    name: z.string(),
    code: z.string(),
    hex: z.string(),
    imageS3Key: z.string(),
    colorSwatchKey: z.string()

})

export type ChatImagenMetadata = z.infer<typeof chatImagenMetadataSchema>