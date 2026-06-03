import { z } from "zod";

export const handlerQuoteWebhookSchema = z.object({
  quoteId: z.string(),
  action: z.enum(["OPERATOR_QUOTE_GENERATION", "AUTOMATED_QUOTE_GENERATION"]),
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

export type HandlerQuoteWebhookBody = z.infer<typeof handlerQuoteWebhookSchema>;


// schema file
export const quoteGenerationMetadataSchema = z.object({
  quoteId: z.string(),
  bookingPrompt: z.string(),
  roomType: z.string(),
  colorNames: z.string(),
  squareFeet: z.unknown().optional(),
  huelineId: z.string().optional(),
  operatorId: z.string().optional(),
  chatThreadId: z.string().optional()
});

export type QuoteGenerationMetadata = z.infer<typeof quoteGenerationMetadataSchema>;