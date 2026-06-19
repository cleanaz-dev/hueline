import { prisma } from "@/lib/prisma";
import { createCommand, lambda } from "@/lib/aws/lambda";
import { acquireResourceLock, setHueClawStatus } from "../redis";
import { getPresignedUrl } from "../aws/s3";

export async function handleLiveKitVoiceEgressEnded(
  roomName: string,
  s3Key: string
) {
 
  const call = await prisma.outboundCall.update({
    where: { roomName },
    data: { audioUrl: s3Key },
    select: { threadId: true, id: true, systemTaskId: true },
  });

  if (!call?.threadId || !call?.systemTaskId) {
    console.warn(`⚠️ No threadId and systemTaskId found for room: ${roomName}`);
    return;
  }
 

  console.log(`✅ Recording S3 Key saved for room: ${roomName}`);

  const webhookUrl = `${process.env.NEXT_PUBLIC_URL}/api/webhooks/hueclaw`;
  const audioUrl = await getPresignedUrl(s3Key)

  const payload = {
    audioUrl, 
    webhookUrl,
    threadId: call.threadId,
    systemTaskId: call.systemTaskId,
  };

  const command = createCommand({
    functionName: "hueline-hueclaw-intelligence-PROD",
    payload,
  });

  // 3. Trigger Redis & Lambda
  await setHueClawStatus(call.threadId, "INTELLIGENCE");
  await lambda.send(command);
}
