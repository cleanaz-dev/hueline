import z from "zod";

export const hueClawQuoteMetadataSchema = z.object({
  threadId: z.string(),
  pendingMessage: z.object({
    deliveryMethod: z.enum(["SMS", "EMAIL", "NONE"]),
    msgBody: z.string().nullable(),
    msgSubject: z.string().nullable(),
  }),
  huelineId: z.string().optional(),
  roomType: z.string(),
  squareFeet: z.number(),
  prompt: z.string().optional(),
  paintColors: z.array(         
    z.object({
      brand: z.string(),
      name: z.string(),
      code: z.string(),
      hex: z.string(),
    })
  ),
});


export type HueClawQuoteMetadata = z.infer<typeof hueClawQuoteMetadataSchema>