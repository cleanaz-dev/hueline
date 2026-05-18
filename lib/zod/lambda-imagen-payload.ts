import { z } from "zod";

export const lambdaPayloadSchema = z.object({
  customerId: z.string().min(1),
  imageUrl: z.url(),
  colorSwatchUrl: z.url(),
  huelineId: z.string().optional(),
  subdomainId: z.string().min(1),
  action: z.enum(["OPERATOR_IMAGEN", "FOLLLOWUP_IMAGEN", "CLIENT_IMAGEN", "NEW_DESIGN_STUDIO_IMAGEN", "EXISTING_DESIGN_STUDIO_IMAGEN"]),
  systemTaskId: z.string().min(1),
  deliveryMethod:z.enum(["SMS", "sms", "email", "EMAIL"])
});


export type LambdaImagenPayload = z.infer<typeof lambdaPayloadSchema>