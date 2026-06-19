import { prisma } from "@/lib/prisma";
import { createCommand, lambda } from "@/lib/aws/lambda";
import { acquireResourceLock, setHueClawStatus } from "../redis";
import { getPresignedUrl } from "../aws/s3";

export async function handleLiveKitVoiceEgressEnded(
  roomName: string,
  s3Key: string, // <-- Changed to s3Key to make it clear what we are passing
) {
  // 1. Save the S3 Key to your DB
  const call = await prisma.outboundCall.update({
    where: { roomName },
    data: { audioUrl: s3Key }, // Storing the S3 Key in your audioUrl column
    select: { threadId: true, id: true },
  });

  if (!call?.threadId) {
    console.warn(`⚠️ No threadId found for room: ${roomName}`);
    return;
  }
 

  console.log(`✅ Recording S3 Key saved for room: ${roomName}`);

  // 2. Prepare Lambda payload
  const webhookUrl = `${process.env.NEXT_PUBLIC_URL}/api/webhooks/hueclaw`;
  const audioUrl = await getPresignedUrl(s3Key)



  const payload = {
    audioUrl, 
    webhookUrl,
    threadId: call.threadId,
  };

  const command = createCommand({
    functionName: "hueline-hueclaw-intelligence-PROD",
    payload,
  });

  // 3. Trigger Redis & Lambda
  await setHueClawStatus(call.threadId, "INTELLIGENCE");
  await lambda.send(command);
}
