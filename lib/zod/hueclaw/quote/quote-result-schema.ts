// @/lib/zod/hueclaw/quote/quote-webhook-schema.ts
import { z } from "zod";

export const hueClawQuoteResultSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      unit: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      price: z.number(),
    }),
  ),
  totalAmount: z.number(),
});

export type HueClawQuoteResult = z.infer<typeof hueClawQuoteResultSchema>;
