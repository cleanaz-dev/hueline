import { z } from "zod";

export const callTriggerSourceSchema = z.enum([
  "CALL_INTELLIGENCE",
  "REPEAT_CALL_INTELLIGENCE",
  "UNCOMPLETED_CALL",
]);

export const voiceMetadataSchema = z.object({
  to: z.string().optional(),
  from: z.string().optional(),
  duration: z.number().optional(),
  callSid: z.string(),
  callId: z.string(),
  bookingId: z.string().optional(), // Not present for unlinked calls
  triggerSource: callTriggerSourceSchema,
});

export type VoiceMetadata = z.infer<typeof voiceMetadataSchema>;
export type CallTriggerSource = z.infer<typeof callTriggerSourceSchema>;