import { prisma } from "@/lib/prisma";

export async function handleLiveKitVoiceEgressEnded(
  roomName: string,
  s3Key: string,
  callId: string,
) {
  await prisma.call.update({
    where: { id: callId },
    data: { audioS3Key: s3Key },
  });

  console.log(`✅ Egress audio S3 key saved for call: ${callId} (Room: ${roomName})`);
}