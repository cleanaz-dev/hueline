import { z } from "zod";

export const visionTagsSchema = z.object({
  room_type: z.string().optional(),
  has_furniture: z.boolean().optional(),
  paintable: z.boolean().optional(),
  description: z.string().optional(),
});

export const mediaAssetMetadataSchema = z.object({
  visionTags: visionTagsSchema.optional(),
  // You can easily add more stuff here later without touching Prisma:
  // source: z.enum(["SMS", "EMAIL", "WEB"]).optional(),
  // resolution: z.string().optional(),
});

export type MediaAssetMetadata = z.infer<typeof mediaAssetMetadataSchema>;