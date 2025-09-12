import { createClient } from "redis"

declare global {
  var redisClient: ReturnType<typeof createClient> | undefined
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

const keys = {
  sentImages: (phoneNumber: string) => `sentImages:${phoneNumber}`,
  booking: (phoneNumber: string) => `booking:${phoneNumber}`
}

export async function pushImageUrl(phoneNumber: string, url: string, expirationSeconds = 300) {
  const client = await getRedisClient();
  const key = keys.sentImages(phoneNumber);
  const list = JSON.parse(await client.get(key) || "[]") as string[];
  list.push(url);
  await client.setEx(key, expirationSeconds, JSON.stringify(list));
  console.log(`✅ Pushed 1 image for ${phoneNumber}`);
}
  
export async function getBooking(phoneNumber: string) {
  const client = await getRedisClient();
  const key = keys.booking(phoneNumber);
  const data = await client.get(key);
  
  if (!data) {
    return null;
  }
  
  return JSON.parse(data);
}