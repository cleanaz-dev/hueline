import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// We use 'context' so you can lock IMAGEN and SMS separately if needed!
type LockContext = "IMAGEN" | "UPSCALE" | "QUOTE"

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