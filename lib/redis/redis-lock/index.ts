import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// We use 'context' so you can lock IMAGEN and SMS separately if needed!
type LockContext = "IMAGEN" | "UPSCALE" | "QUOTE" | "COMMS" | "NUDGE" | "INTELLIGENCE" | "OUTBOUND_CALL"

export async function acquireResourceLock(resourceId: string, context: LockContext = "IMAGEN") {
  const lockKey = `lock:${context}:${resourceId}`;
  
  // ATOMIC LOCK: Only sets if it doesn't exist. Expires in 5 mins (300s).
  const acquired = await redis.set(lockKey, "PENDING", { nx: true, ex: 300 });
  
  // Return the key if successful so the route knows what to unlock later, otherwise null
  return acquired ? lockKey : null; 
}

export async function updateLockWithTaskId(lockKey: string, taskId: string) {
  // Overwrites "PENDING" with the real Prisma ID, resets the 5-min timer
  await redis.set(lockKey, taskId, { ex: 300 });
}

export async function releaseResourceLock(lockKey: string) {
  if (!lockKey) return; 
  await redis.del(lockKey);
}



type HueClawStatus = "COMMUNICATION" | "IMAGEN" | "QUOTE" | "NUDGE" | "INTELLIGENCE" | "OUTBOUND_CALL"
export async function setHueClawStatus(threadId: string, status: HueClawStatus = "NUDGE" ) {
  // Key format: hueclaw:status:12345
  // TTL: 300 seconds (5 minutes)
  await redis.setex(`hueclaw:status:${threadId}`, 300, status);
}

export async function getHueClawStatus(threadId: string) {
  return await redis.get(`hueclaw:status:${threadId}`);
}

export async function clearHueClawStatus(threadId: string) {
  await redis.del(`hueclaw:status:${threadId}`);
}