import { prisma } from "@/lib/prisma";
import { invalidateThreadCache } from "@/lib/redis/agent-context";

export async function handleLiveKitVoiceEgressEnded(
  roomName: string,
  s3Key: string,
  callId: string,
) {
  const call = await prisma.call.update({
    where: { id: callId },
    data: { audioS3Key: s3Key },
    select: {
      subdomain: { select: { slug: true } },
      threadId: true,
    },
  });

  await invalidateThreadCache(call.subdomain?.slug!, call.threadId!);

  console.log(`✅ Egress audio S3 key saved for call: ${callId} (Room: ${roomName})`);
}