"use server"
import { after } from "next/server";
import { acquireResourceLock, clearHueClawStatus, releaseResourceLock, setHueClawStatus } from "@/lib/redis";
import { invalidateThreadCache } from "@/lib/redis/agent-context";
import { pusherServer } from "@/lib/pusher/pusher-server";
import { createCallIntelligenceTask } from "../services/system-tasks/create-call-intelligence-task";
import { invokeCallIntelligenceLambda } from "../aws/lambda";
import { getCallForIntelligence } from "../prisma/queries";
import { updateCallwithTranscript } from "../hueclaw/services/update-call-with-transcript";
import { getTwilioAudioUrl } from "./handle-get-twilio-audio";

export async function handleLiveKitVoiceRoomEnded(roomName: string) {
  let lockKey: string | null = null;
  try {
    const callData = await getCallForIntelligence(roomName);
    if (!callData) return;

    const { callId, threadId, customerId, subdomainId, slug, intelligence, callSid } = callData;

    if (callSid) {
      after(async () => {
        await getTwilioAudioUrl(callSid, subdomainId, threadId, customerId, callId, slug!);
      });
    }

    const { transcript } = await updateCallwithTranscript(callId);

    lockKey = await acquireResourceLock(threadId, "INTELLIGENCE");

    await pusherServer.trigger(`thread-${threadId}`, "call-ended", { callId });

    await clearHueClawStatus(threadId);

    const { taskId } = await createCallIntelligenceTask({
      callId,
      customerId,
      subdomainId,
      lockKey: lockKey!,
      callMetadata: {
        threadId,
        callId,
        callType: "INBOUND",
        roomName,
        transcript,
      },
    });

    const webhookUrl = "https://www.hue-line.com/api/webhooks/hueclaw";

    await invokeCallIntelligenceLambda({
      payload: {
        systemTaskId: taskId,
        threadId,
        transcript: JSON.stringify(transcript),
        webhookUrl,
        config: JSON.stringify(intelligence),
      },
    });

    await invalidateThreadCache(slug, threadId);

    await setHueClawStatus(threadId, "INTELLIGENCE");
  } catch (error) {
    if (lockKey) await releaseResourceLock(lockKey);
    console.error(`❌ [RoomEnded] Failed to process room_ended for ${roomName}:`, error);
  }
}