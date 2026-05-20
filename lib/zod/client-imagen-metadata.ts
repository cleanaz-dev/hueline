import z from "zod";

export const clientImagenMetadataSchema = z.object({
  huelineId: z.string(),
  brand: z.string(),
  code: z.string(),
  name: z.string(),
  hex: z.string(),
  removeFurniture: z.boolean(),
  imageS3Key: z.string(),
  roomType: z.string(),
  colorSwatchKey: z.string(),
});


export type ClientImagenMetadata = z.infer<typeof clientImagenMetadataSchema>