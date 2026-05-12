import { z } from "zod";

export const voiceMetadataSchema = z.object({
  to: z.string().startsWith("+"),
  from: z.string().startsWith("+"),
  duration: z.number(),
  callSid: z.string(),
  callId: z.string(),
  bookingId: z.string()
});

export type VoiceMetadata = z.infer<typeof voiceMetadataSchema>;
