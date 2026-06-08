import { z } from "zod";

export const aiResultSchema = z.object({
  generateImage: z.boolean().default(false),
  generateQuote: z.boolean().default(false),
  contactRequired: z.boolean().default(false),
  suggestedDeliveryMethod: z.enum(["SMS", "EMAIL"]),
  suggestedSms: z.string().nullable().optional(),
  suggestedEmail: z.object({
    subject: z.string(),
    body: z.string()
  }).nullable().optional(),
});

export type AiResult = z.infer<typeof aiResultSchema>