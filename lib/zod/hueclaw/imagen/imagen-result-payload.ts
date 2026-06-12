import z from "zod";

export const imagenResultPayloadSchema = z.object({
  s3Key: z.string(),
  compressedS3Key: z.string(),
  systemTaskId: z.string(),
});

export type ImagenResultPayload = z.infer<typeof imagenResultPayloadSchema>;

export const hueClawImagenResultPayloadSchema = z.object({
  newImagenS3Key: z.string(),
  compressedS3Key: z.string(),
  selectedColorId: z.string(),
  selectedColorHex: z.string(),
  selectedColorName: z.string(),
  selectedColorCode: z.string(),
  selectedColorBrand: z.string(),
});
