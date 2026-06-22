import z from "zod";

export const hueClawCallMetadataSchema = z.object({
  // shared
  callId: z.string(),
  roomName: z.string(),
  threadId: z.string(),

  // outbound only
  callType: z.string().optional(),
  operatorNumber: z.string().optional(),
  customerNumber: z.string().optional(),

  // inbound only
  callSid: z.string().optional(),
  duration: z.string().optional(),
  status: z.string().optional(),
});

export type HueClawCallMetadata = z.infer<typeof hueClawCallMetadataSchema>;