import z from "zod";

export const aiQuoteItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  quantity: z.number(),
  unit: z.string(),
  unitPrice: z.number(),
  price: z.number(),
});

export const aiQuoteSchema = z.object({
  items: z.array(aiQuoteItemSchema),
  total_amount: z.number(),
});

export type AiQuoteSchema = z.infer<typeof aiQuoteSchema>;
export type AiQuoteItem = z.infer<typeof aiQuoteItemSchema>;