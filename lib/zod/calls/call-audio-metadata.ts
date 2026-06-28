import z from "zod";


export const callAudioResultSchema = z.object({
  audioS3Key: z.string(),
  callSid: z.string()
});



export const callAudioMetadataSchema = z.object({
  threadId: z.string(),
  callId: z.string(),
  slug: z.string(),
  callSid: z.string()
});

export type CallAudioMetadata = z.infer<typeof callAudioMetadataSchema>