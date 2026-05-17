import z from "zod";
import { BrandId } from "../desing-studio-config";

export const designImagenBodySchema = z.object({
  brand: z.enum(["sherwin_williams", "benjamin_moore", "behr", "ral"] as const),
  code: z.string(),
  hex: z.string(),
  name: z.string(),
  removeFurniture: z.boolean(),
  huelineId: z.string().optional(),
  customerId: z.string().optional(),
  deliveryMethod: z.enum(["SMS", "EMAIL"]).nullable(),
});

export type DesignImagenBody = z.infer<typeof designImagenBodySchema>