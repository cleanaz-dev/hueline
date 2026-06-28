import { z } from "zod";

export const callIntelligenceMetadataSchema = z.object({
  callId: z.string(),
  threadId: z.string(),
  roomName: z.string(),
  callType: z.string(),
  transcript: z.unknown(),
});

export type CallIntelligenceMetadata = z.infer<typeof callIntelligenceMetadataSchema>;