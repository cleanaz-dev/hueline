import { z } from "zod";

export const lambdaPayloadSchema = z.object({
  customerId: z.string().min(1),
  imageUrl: z.url(),
  targetColor: z.object({
    name: z.string(),
    code: z.string(),
    hex: z.string(),
    brand: z.string(),
  }),
  huelineId: z.string().min(1),
  subdomainId: z.string().min(1),
  action: z.string(),
  systemTaskId: z.string().min(1),
});


export type LambdaImagenPayload = z.infer<typeof lambdaPayloadSchema>