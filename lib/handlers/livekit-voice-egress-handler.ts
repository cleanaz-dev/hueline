import { prisma } from "@/lib/prisma";
import { createCommand, lambda } from "@/lib/aws/lambda";
import { setHueClawStatus } from "../redis";

export async function handleLiveKitVoiceEgressEnded(
  roomName: string,
  audioUrl: string,
) {
  const call = await prisma.outboundCall.update({
    where: { roomName },
    data: { audioUrl },
    select: { threadId: true },
  });

  if (!call?.threadId) {
    console.warn(`⚠️ No threadId found for room: ${roomName}`);
    return;
  }

  console.log(`✅ Recording saved for room: ${roomName}`);

  const webhookUrl = `${process.env.NEXT_PUBLIC_URL}/api/webhooks/hueclaw`;

  const payload = {
    audioUrl,
    webhookUrl,
    threadId: call.threadId,
  };

  const command = createCommand({
    functionName: "hueline-hueclaw-intelligence-PROD",
    payload,
  });

  await setHueClawStatus(call.threadId, "COMMUNICATION");
  await lambda.send(command);
}