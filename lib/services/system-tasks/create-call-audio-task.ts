import { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { CallAudioMetadata } from "@/lib/zod/calls/call-audio-metadata";

interface CreateCallAudioTaskProps {
  callId: string;
  callSid: string;
  subdomainId: string;
  customerId: string;
  lockKey: string;
  taskMetadata: CallAudioMetadata;
}

export async function createCallAudioTask({
  callId,
  subdomainId,
  customerId,
  lockKey,
  taskMetadata,
}: CreateCallAudioTaskProps) {
  const task = await prisma.systemTask.create({
    data: {
      deliveryMethod: "NONE",
      initiator: "AI",
      lockKey,
      calls: { connect: { id: callId } },
      customer: { connect: { id: customerId } },
      subdomain: { connect: { id: subdomainId } },
      status: "PROCESSING",
      type: "AUDIO",
      metadata: taskMetadata as unknown as Prisma.InputJsonValue,
    },
  });

  return { taskId: task.id };
}