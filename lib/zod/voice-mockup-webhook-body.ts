import { z } from "zod";

const mockupUrlSchema = z.object({
  s3_key:    z.string(),
  room_type: z.string(),
});

export const voiceMockupWebhookBodySchema = z.object({
  jobId:        z.string(),
  huelineId:    z.string(),
  slug:         z.string(),
  prompt:       z.string(),
  summary:      z.string(),
  subdomainId:  z.string(),
  name:         z.string(),
  phone:        z.string(),
  imageS3Key:   z.string(),
  roomType:     z.string(),
  colorBrand:   z.string(),
  colorName:    z.string(),
  colorCode:    z.string(),
  colorHex:     z.string(),
  dimensions:   z.string(),
  pin:          z.string(),
  callSid:      z.string(),
  callDuration: z.string(),
  dateTime:     z.string(),
  size:         z.number().optional(),
  mockupUrls:   z.array(mockupUrlSchema),
  action:       z.literal("LIVEKIT_AGENT"),
});

export type VoiceMockupWebhookBody = z.infer<typeof voiceMockupWebhookBodySchema>;