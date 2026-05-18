import { z } from "zod";
import type { BrandId } from "../desing-studio-config";

const BrandIdSchema = z.enum([
  "sherwin_williams",
  "benjamin_moore",
  "behr",
  "ral",
]);

// Belt-and-suspenders: if someone adds a brand to BrandId but forgets
// to update the schema, this type assertion will scream at compile time.
type _Check = BrandId extends z.infer<typeof BrandIdSchema> ? true : never;

export const DesignStudioGenerateSchema = z.object({
  color: z.object({
    // Make sure it strictly accepts these 4 options to match your frontend BrandId
    brand: z.enum(["sherwin_williams", "benjamin_moore", "behr", "ral"]),
    code: z.string(),
    hex: z.string(),
    name: z.string(),
  }),
  removeFurniture: z.boolean(),
  customerId: z.string(), 
  huelineId: z.string().nullable().optional(),
  deliveryMethod: z.enum(["sms", "email", "SMS", "EMAIL"]), 
  // Enforce that it cannot be an empty string
  roomType: z.string().min(1, { message: "Room type is required" }), 
});

export type DesignStudioGenerateBody = z.infer<
  typeof DesignStudioGenerateSchema
>;