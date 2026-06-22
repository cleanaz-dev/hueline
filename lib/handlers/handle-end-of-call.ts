import { lambda, createCommand } from "../aws/lambda";
import { prisma } from "../prisma";
import { HueClawCallMetadata } from "../zod/hueclaw/calls/hueclaw-call-metadata-schema";


interface HandleEndOfCallParams {
  callId: string;
  customerId: string;
  slug: string;
  threadId: string;
  duration: string | number;
  status: string;
  roomName: string;
  callSid: string;
  lockKey: string;
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
  lockKey,
}: HandleEndOfCallParams) {
  const task = await prisma.systemTask.create({
    data: {
      deliveryMethod: "NONE",
      initiator: "AI",
      lockKey: lockKey,
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
      } satisfies HueClawCallMetadata
    },
  });

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/hueclaw`;

  const payload = {
    system_task_id: task.id,
    call_sid: callSid,
    hueline_id: callId,
    slug,
    domain_id: customerId,
    webhook_url: webhookUrl,
  };

  const command = createCommand({
    functionName: "hueline-get-twilio-media-url",
    payload,
  });

  await lambda.send(command);

  return task;
}
