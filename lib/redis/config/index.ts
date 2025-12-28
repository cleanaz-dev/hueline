import { createClient } from "redis"

declare global {
  var redisClient: ReturnType<typeof createClient> | undefined
}

export function logWithTime(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
}
function connectOnceToRedis() {
  if (!globalThis.redisClient) {
    globalThis.redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    globalThis.redisClient.on("error", (err) =>
      console.log("Redis Client Error:", err)
    );
  }
  return globalThis.redisClient;
}

export async function getRedisClient() {
  const client = connectOnceToRedis();

  if (!client.isReady) {
    await client.connect();
  }

  return client;
}


export const keys = {
  sentImages: (phoneNumber: string): string => `sentImages:${phoneNumber}`,
  booking: (phoneNumber: string): string => `booking:${phoneNumber}`,
  subBooking: (subdomain: string, phoneNumber: string): string => `booking:${subdomain}:${phoneNumber}`,
  slug: (slug: string): string => `slug:${slug}`,
  export: (jobId: string): string => `export:${jobId}`,
  room: (roomId: string): string => `room:${roomId}`,
  roomScope: (roomId: string): string => `room:${roomId}:scope`
}