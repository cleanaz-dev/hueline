import { hueclawCommsMetadataSchema } from "@/lib/zod/hueclaw/comms-metadata";
import { aiResultSchema } from "@/lib/zod/hueclaw/result-payload";
import { handleHueClawImagen } from "@/lib/hueclaw/handlers/imagen";
import { handleHueClawQuote } from "@/lib/hueclaw/handlers/quote";
import { handleHueClawCommunication } from "@/lib/hueclaw/handlers/communication";
import { setHueClawStatus } from "@/lib/redis";

export async function processNudgeReturn(task: any, rawResult: any) {
  const metadata = hueclawCommsMetadataSchema.parse(task.metadata);
  const result = aiResultSchema.parse(rawResult); // .parse() cleanly throws if invalid
  const threadId = metadata.threadId;

  // Pack the Backpack
  const pendingMessage = {
    deliveryMethod: result.suggestedDeliveryMethod,
    msgBody: result.suggestedDeliveryMethod === "SMS" ? (result.suggestedSms ?? null) : (result.suggestedEmail?.body ?? null),
    msgSubject: result.suggestedDeliveryMethod === "EMAIL" ? (result.suggestedEmail?.subject ?? null) : null,
  };

  // Route: Image
  if (result.generateImage) {
    await setHueClawStatus(threadId, "IMAGEN");
    await handleHueClawImagen(threadId, task.lockKey, pendingMessage);
    return { releaseLock: false, threadId, message: "Handed off to Imagen" };
  }

  // Route: Quote
  if (result.generateQuote) {
    await setHueClawStatus(threadId, "QUOTE");
    await handleHueClawQuote(threadId, task.lockKey, pendingMessage);
    return { releaseLock: false, threadId, message: "Handed off to Quote" };
  }

  // Route: Direct Comms (End of flow)
  // Figure this one out so its works
  await handleHueClawCommunication({ threadId, lockKey: task.lockKey, pendingMessage });
  return { releaseLock: true, threadId, message: "Direct comms executed" };
}