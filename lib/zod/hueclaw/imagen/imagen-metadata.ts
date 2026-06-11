import z from "zod";

export const hueClawImagenMetadataSchema = z.object({
    string1: z.string(),
    string2: z.string(),
    srting3: z.string()
})

export type HueClawImagenMetadata = z.infer<typeof hueClawImagenMetadataSchema>