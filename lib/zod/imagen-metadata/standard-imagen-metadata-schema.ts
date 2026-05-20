import z from "zod";

export const standardImagenMetadataSchema = z.object({
  brand: z.string(),
  name: z.string(),
  code: z.string(),
  hex: z.string(),
  imageS3Key: z.string(),
  colorSwatchKey: z.string(),
  huelineId: z.string(),
  roomType: z.string(),
  removeFurniture: z.boolean().default(false),
});

export type StandardImageMetadata = z.infer<
  typeof standardImagenMetadataSchema
>;