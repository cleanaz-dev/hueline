import { lambda, createCommand } from "../aws/lambda";
import { acquireResourceLock } from "../redis";
import { createCallAudioTask } from "../services/system-tasks/create-call-audio-task";

export async function getTwilioAudioUrl(
  callSid: string,
  subdomainId: string,
  threadId: string,
  customerId: string,
  callId: string,
  slug: string,
) {
  let lockKey: string | null = null;
  try {
    lockKey = await acquireResourceLock(threadId, "AUDIO");

    const { taskId } = await createCallAudioTask({
      callId,
      callSid,
      subdomainId,
      customerId,
      lockKey: lockKey!,
      taskMetadata: {
        callId,
        callSid,
        threadId,
        slug,
      },
    });

    const webhookUrl = "https://www.hue-line.com/api/webhooks/hueclaw";
    const command = createCommand({
      functionName: "hueline-hueclaw-twilio-audio",
      payload: {
        callSid,
        webhookUrl,
        systemTaskId: taskId,
        subdomainId,
        callId,
      },
      invocationType: "Event",
    });

    await lambda.send(command);
  } catch (error) {
    console.error(`❌ [TwilioAudio] Failed for callSid ${callSid}:`, error);
  }
}
