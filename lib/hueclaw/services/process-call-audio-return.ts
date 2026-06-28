import { SystemTask } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

import { invalidateThreadCache } from "@/lib/redis/agent-context";
import { callAudioMetadataSchema, callAudioResultSchema } from "@/lib/zod/calls/call-audio-metadata";


export async function processCallAudioReturn(task: SystemTask, result: unknown) {
  const { audioS3Key, callSid } = callAudioResultSchema.parse(result);
  const { threadId, callId, slug } = callAudioMetadataSchema.parse(task.metadata);

  await prisma.call.update({
    where: { id: callId },
    data: { audioS3Key },
  });

  await invalidateThreadCache(slug, threadId);

  return {
    releaseLock: true,
    threadId,
    message: `Audio saved for call ${callId}`,
  };
}