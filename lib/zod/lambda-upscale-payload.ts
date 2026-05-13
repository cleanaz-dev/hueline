import { z } from "zod";

export const upscalePayloadSchema = z.object({
  subdomainId: z.string().min(1),
  imageUrls: z.array(z.url()),
  action: z.literal("IMAGE_UPSCALE"),
  huelineId: z.string().min(1),
  resolution: z.enum(["4K", "8K"]),
  systemTaskId: z.string().min(1),
});


export type LambdaUpscalePayload = z.infer<typeof upscalePayloadSchema>