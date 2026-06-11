import z from "zod";

export const hueClawQuoteMetadataSchema = z.object({

})

export type HueClawQuoteMetadata = z.infer<typeof hueClawQuoteMetadataSchema>