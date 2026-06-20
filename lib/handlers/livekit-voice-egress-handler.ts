import { prisma } from "@/lib/prisma";
import { createCommand, lambda } from "@/lib/aws/lambda";
import { acquireResourceLock, clearHueClawStatus, setHueClawStatus } from "../redis";
import { getPresignedUrl } from "../aws/s3";

export async function handleLiveKitVoiceEgressEnded(
  roomName: string,
  s3Key: string,
  callId: string // ✅ Added callId here
) {
  
  // ✅ Find and update using callId instead of roomName
  const call = await prisma.call.update({
    where: { id: callId }, 
    data: { audioUrl: s3Key },
    select: { threadId: true, id: true, systemTaskId: true },
  });

  if (!call?.threadId || !call?.systemTaskId) {
    console.warn(`⚠️ No threadId and systemTaskId found for callId: ${callId}`);
    return;
  }

  console.log(`✅ Recording S3 Key saved for call: ${callId} (Room: ${roomName})`);

  const webhookUrl = `${process.env.NEXT_PUBLIC_URL}/api/webhooks/hueclaw`;
  const audioUrl = await getPresignedUrl(s3Key);

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
  await clearHueClawStatus(call.threadId);
  await setHueClawStatus(call.threadId, "INTELLIGENCE");
  await lambda.send(command);
}