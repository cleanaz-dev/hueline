import z from "zod";

export const imagenResultPayloadSchema = z.object({
    s3Key: z.string(),
    compressedS3Key: z.string(),
    systemTaskId: z.string()
})

export type ImagenResultPayload = z.infer<typeof imagenResultPayloadSchema>