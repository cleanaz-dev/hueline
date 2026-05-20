import z from "zod";

export const designStudioMetadataSchema = z.object({
  brand: z.string(),
  code: z.string(),
  name: z.string(),
  hex: z.string(),
  removeFurniture: z.boolean(),
  imageS3Key: z.string(),
  roomType: z.string(),
  colorSwatchKey: z.string(),
  designProjectId: z.string(),
});


export type DesignStudioMetadata = z.infer<typeof designStudioMetadataSchema>