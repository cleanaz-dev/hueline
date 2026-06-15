import { z } from "zod";

// 1. Matches exactly what HueClaw/Lambda is returning
export const quoteItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  unit: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  price: z.number(),
});

// 2. The main metadata schema
export const quoteCommsMetadataSchema = z.object({
  quoteId: z.string(),
  totalAmount: z.number(),
  itemCount: z.number(),
  items: z.array(quoteItemSchema),
  quoteLink: z.string().url(),
});

export type QuoteCommsMetadata = z.infer<typeof quoteCommsMetadataSchema>;