import z from "zod";

export const hueClawOutboundCallMetadataSchema = z.object({
  callId: z.string(),
  roomName: z.string(),
  threadId: z.string(),
  callType: z.string(),
  operatorNumber: z.string(),
  customerNumber: z.string(),
});


export type HueClawOutboundCallMetadata = z.infer<typeof hueClawOutboundCallMetadataSchema>