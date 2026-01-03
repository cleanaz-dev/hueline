// lib/livekit/handlers/egress-ended.ts
import { WebhookEvent, EgressStatus } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";

export async function handleEgressEnded(event: WebhookEvent) {
  const { egressInfo } = event;

  const isComplete = egressInfo?.status === EgressStatus.EGRESS_COMPLETE;
  const fileData = egressInfo?.fileResults?.[0];

  if (isComplete && fileData) {
    const roomName = egressInfo.roomName;
    const s3Key = fileData.filename;

    if (s3Key && roomName) {
      console.log(`💾 Saving recording: ${s3Key} for room: ${roomName}`);

      await prisma.room.update({
        where: { roomKey: roomName },
        data: {
          recordingUrl: s3Key,
          endedAt: new Date()
        }
      });

      console.log(`✅ Recording saved successfully`);
    }
  }
}