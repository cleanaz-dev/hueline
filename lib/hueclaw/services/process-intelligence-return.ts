import { CallOutcome, CallReason, SystemTask } from "@/app/generated/prisma";
import { hueClawCallMetadataSchema } from "@/lib/zod/hueclaw/calls/hueclaw-call-metadata-schema";
import { intelligenceResultSchema } from "@/lib/zod/intelligence/intelligence-result-schema";
import { prisma } from "@/lib/prisma";
import { invalidateThreadCache } from "@/lib/redis/agent-context";

export async function processIntelligenceReturn(task: SystemTask, result: any) {
  // 1. Parse Metadata & Payload
  const metadata = hueClawCallMetadataSchema.parse(task.metadata);
  const { callId, threadId, callType } = metadata;

  // 2. Parse Results from Lambda
  const parsedData = intelligenceResultSchema.parse(result);
  const { intelligence, transcriptText, audioUrl } = parsedData;

  // 3. Validate Database Relations
  const customer = await prisma.customer.findUnique({ where: { id: task.customerId! } });
  if (!customer) throw new Error(`Customer not found for task ${task.id}`);

  const subdomain = await prisma.subdomain.findUnique({
    where: { id: task.subdomainId },
    select: { id: true, slug: true },
  });
  if (!subdomain) throw new Error(`Subdomain not found for ${task.subdomainId}`);

  const isOutbound = !!callType && callType !== "INBOUND";

  console.log(`[Intelligence] 🧠 Processing for Call: ${callId} - Reason: ${intelligence.callReason}`);

  // 4. Update Call & Create CallIntelligence
  const call = await prisma.call.update({
    where: { id: callId },
    data: {
      // inbound: write s3 audio url back to the call record
      ...(!isOutbound && audioUrl && { audioUrl }),
      intelligence: {
        create: {
          transcriptText,
          callReason: (intelligence.callReason as CallReason) || "OTHER",
          callSummary: intelligence.callSummary,
          callOutcome: intelligence.callOutcome as CallOutcome,
          projectScope: intelligence.projectScope ?? "UNKNOWN",
          estimatedAdditionalValue: intelligence.estimatedAdditionalValue ?? 0,
        },
      },
    },
  });

  await prisma.clientActivity.create({
    data: {
      type: isOutbound ? "OUTBOUND_CALL" : "INBOUND_CALL",
      chatThread: { connect: { id: threadId } },
      customer: { connect: { id: customer.id } },
      description: callType ? `Call type: ${callType}` : "Inbound call",
      title: isOutbound ? "Outbound Call" : "Inbound Call",
    },
  });

  await prisma.clientCommunication.create({
    data: {
      body: isOutbound ? "Outbound Call" : "Inbound Call",
      role: "AI",
      type: "VOICE",
      chatThread: { connect: { id: threadId } },
      customer: { connect: { id: customer.id } },
      metadata: {
        audioS3Key: call.audioS3Key,
        outcome: intelligence.callOutcome,
        transcript: transcriptText,
      },
    },
  });

  await invalidateThreadCache(subdomain.slug, threadId);

  return {
    releaseLock: true,
    threadId,
    message: `Intelligence logged. Outcome: ${intelligence.callOutcome}`,
  };
}