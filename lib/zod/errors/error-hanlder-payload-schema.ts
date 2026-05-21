import { z } from "zod";

export const errorHandlerPayloadSchema = z.object({
  source: z.string(),
  stage: z.string(),
  error: z.string(),

  // Optional context
  messageId:    z.string().optional(),
  systemTaskId: z.string().optional(),
  huelineId:    z.string().optional(),
  customerId:   z.string().optional(),
});

export type ErrorHandlerPayload = z.infer<typeof errorHandlerPayloadSchema>;