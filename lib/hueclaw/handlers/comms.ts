import { prisma } from "@/lib/prisma";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const lambda = new LambdaClient({ region: "us-east-1" });

export async function handleHueClawComms(
  threadId: string, 
  lockKey: string,
  body: any
) {
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      communications: true,
      activities: true,
      customer: true,
    },
  });

  if (!thread) throw new Error(`Thread ${threadId} not found`);

  const mappedActivities = thread.activities.map((act) => ({
    role: "SYSTEM",
    type: "ACTIVITY",
    body: act.title || act.type.replace(/_/g, " "),
    createdAt: act.createdAt,
  }));

  const timeline = [...thread.communications, ...mappedActivities].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const systemTask = await prisma.systemTask.create({
    data: {
        deliveryMethod: "NONE",
        initiator: "HUECLAW",
        lockKey,
        type: "COMMUNICATION",
        status: "PROCESSING",
        customer: {connect: {id: thread.customerId}},
        subdomain: {connect: {id: thread.subdomainId}},
        metadataSource: "COMMUNICATION",
        metadata: {
            threadId,
            trigger: "comms",
            ...body

        }

    }
  })

  const payload = {
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/hueclaw`,
    deliveryMethod:  "NONE",
    customerName: thread.customer.name,
    recentMessages: timeline.slice(-15).map((m) => ({
      role: m.role,
      type: m.type,
      body: m.body,
    })),
    systemTaskId: systemTask.id
  };

  const command = new InvokeCommand({
    FunctionName: "hueline-hueclaw-comms-PROD",
    InvocationType: "Event",
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  await lambda.send(command);
}