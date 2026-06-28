import { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";

interface CallIntelligenceMetadata {
  callId: string;
  threadId: string;
  roomName: string;
  callType: string;
  transcript: Prisma.JsonValue;
}

interface CallIntelligenceProps {
  callId: string;
  subdomainId: string;
  customerId: string;
  lockKey:string;
  callMetadata: CallIntelligenceMetadata;
}

export async function createCallIntelligenceTask({
  callId,
  subdomainId,
  customerId,
  lockKey,
  callMetadata,
}: CallIntelligenceProps) {
  
  const task = await prisma.systemTask.create({
    data: {
      deliveryMethod: "NONE",
      initiator: "AI",
      lockKey,
      calls: { connect: { id: callId } },
      customer: { connect: { id: customerId } },
      subdomain: { connect: { id: subdomainId } },
      status: "PROCESSING",
      type: "INTELLIGENCE",
      model: "assembly-ai",
      metadata: callMetadata as unknown as Prisma.InputJsonValue
    },
  });

  return { taskId: task.id };
}