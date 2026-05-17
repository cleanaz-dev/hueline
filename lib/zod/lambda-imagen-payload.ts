import { z } from "zod";

export const lambdaPayloadSchema = z.object({
  customerId: z.string().min(1),
  imageUrl: z.url(),
  colorSwatchUrl: z.string(),
  huelineId: z.string().min(1).optional(),
  subdomainId: z.string().min(1),
  action: z.string(),
  systemTaskId: z.string().min(1),
});


export type LambdaImagenPayload = z.infer<typeof lambdaPayloadSchema>