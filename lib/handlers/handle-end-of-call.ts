import { lambda, createCommand } from "../aws/lambda";
import { prisma } from "../prisma";

interface HandleEndOfCallParams {
  callId: string;
  customerId: string;
  slug: string;
  threadId: string;
  duration: string | number;
  status: string;
  roomName: string;
  callSid: string;
  acquiredLockKey: string;
}

export async function handleEndOfCall({
  callId,
  customerId,
  slug,
  threadId,
  duration,
  status,
  roomName,
  callSid,
  acquiredLockKey,
}: HandleEndOfCallParams) {
  const task = await prisma.systemTask.create({
    data: {
      deliveryMethod: "NONE",
      initiator: "AI",
      lockKey: acquiredLockKey,
      status: "PROCESSING",
      type: "INTELLIGENCE",
      model: "assembly/ai",
      calls: { connect: { id: callId } },
      customer: { connect: { id: customerId } },
      subdomain: { connect: { slug } },
      metadata: {
        callId,
        callSid,
        threadId,
        roomName,
        duration: String(duration),
        status,
      },
    },
  });

  const payload = {
    system_task_id: task.id,
    call_sid: callSid,
    hueline_id: callId,
    slug,
    domain_id: customerId,
  };

  const command = createCommand({
    functionName: "hueline-get-twilio-media-url",
    payload,
  });

  await lambda.send(command);

  return task;
}
