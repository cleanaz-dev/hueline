import { pusherServer } from "@/lib/pusher/pusher-server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type LockContext =
  | "IMAGEN"
  | "UPSCALE"
  | "QUOTE"
  | "COMMS"
  | "NUDGE"
  | "INTELLIGENCE"
  | "OUTBOUND_CALL";

export async function acquireResourceLock(
  resourceId: string,
  context: LockContext = "IMAGEN",
) {
  const lockKey = `lock:${context}:${resourceId}`;
  const acquired = await redis.set(lockKey, "PENDING", { nx: true, ex: 300 });
  return acquired ? lockKey : null;
}

export async function updateLockWithTaskId(lockKey: string, taskId: string) {
  await redis.set(lockKey, taskId, { ex: 300 });
}

export async function releaseResourceLock(lockKey: string) {
  if (!lockKey) return;
  await redis.del(lockKey);
}

export type HueClawStatus =
  | "COMMUNICATION"
  | "IMAGEN"
  | "QUOTE"
  | "NUDGE"
  | "INTELLIGENCE"
  | "OUTBOUND_CALL"
  | "DIALING_OPERATOR"
  | "OPERATOR_CONNECTED"
  | "DIALING_CUSTOMER"
  | "CALL_CONNECTED"
  | "GATHERING_DETAILS"
  | "SPEAKING_WITH_CLIENT"
  | "CALL_WRAPPING"
  | "LIVE_IMAGEN";

export async function setHueClawStatus(
  threadId: string,
  status: HueClawStatus = "NUDGE",
) {
  // 1. Set the status in Redis (acts as the source of truth for new page loads)
  await redis.setex(`hueclaw:status:${threadId}`, 300, status);

  // 2. Broadcast the update to anyone currently viewing this thread
  await pusherServer.trigger(`thread-${threadId}`, "status-update", {
    isWorking: true,
    taskType: status,
  });
}


export async function getHueClawStatus(threadId: string) {
  return await redis.get(`hueclaw:status:${threadId}`);
}

export async function clearHueClawStatus(threadId: string) {
  // 1. Clear from Redis
  await redis.del(`hueclaw:status:${threadId}`);

  // 2. Broadcast the clear event
  await pusherServer.trigger(`thread-${threadId}`, "status-update", {
    isWorking: false,
    taskType: null,
  });
}