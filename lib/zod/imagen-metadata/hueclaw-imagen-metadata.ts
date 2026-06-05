import z from "zod";

export const hueClawImagenMetadataSchema = z.object({
  threadId: z.string(),  
  imageS3Key: z.string(),
  colorSwatchKey: z.string().optional(),
  huelineId: z.string(),
  roomType: z.string(),
  removeFurniture: z.boolean().default(false),
   pendingMessage: z.object({
    deliveryMethod: z.enum(["SMS", "EMAIL", "NONE"]),
    msgBody: z.string().nullable(),
    msgSubject: z.string().nullable(),
  })
});

export type HueClawImageMetadata = z.infer<
  typeof hueClawImagenMetadataSchema
>;