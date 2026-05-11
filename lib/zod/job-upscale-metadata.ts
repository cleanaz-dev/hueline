import { z } from "zod";

export const upscaleMetadata = z.object({
  resolution: z.enum(["4K", "8K"]),
  exportId: z.string().min(1),
  imageCount: z.int().min(1),
  twilioFromNumber: z.string().startsWith("+"),
  phoneNumber: z.string().startsWith("+"),
  s3Keys: z.array(z.string()),
  roomType: z.string()
});

export type ImageUpscaleMetadata = z.infer<typeof upscaleMetadata>