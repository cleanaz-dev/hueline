import { createClient } from "redis"

declare global {
  var redisClient: ReturnType<typeof createClient> | undefined
}

function logWithTime(message: string) {
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

const keys = {
  sentImages: (phoneNumber: string) => `sentImages:${phoneNumber}`,
  booking: (phoneNumber: string) => `booking:${phoneNumber}`,
  subBooking: (subdomain: string, phoneNumber: string ) => `booking:${subdomain}:${phoneNumber}`
}

export async function pushImageUrl(phoneNumber: string, url: string, expirationSeconds = 3600) {
  const client = await getRedisClient();
  const key = keys.sentImages(phoneNumber);
  const list = JSON.parse(await client.get(key) || "[]") as string[];
  list.push(url);
  await client.setEx(key, expirationSeconds, JSON.stringify(list));
  logWithTime(`✅ Pushed 1 image for ${phoneNumber}`);
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

export async function updateBookingWithAltMockup(phoneNumber: string, altMockupUrl: string, expirationSeconds = 3600) {
  const client = await getRedisClient();
  const key = keys.booking(phoneNumber);
  
  // Get existing booking data
  const existingData = await client.get(key);
  
  if (!existingData) {
    logWithTime(`❌ No existing booking found for ${phoneNumber}`);
    return null;
  }
  
  // Parse and update with alternate mockup
  const bookingData = JSON.parse(existingData);
  bookingData.alt_mockup_url = altMockupUrl;
  
  // Save back to Redis
  await client.setEx(key, expirationSeconds, JSON.stringify(bookingData));
  logWithTime(`✅ Updated booking with alt mockup for ${phoneNumber}`);
  
  return bookingData;
}

export async function getSubBooking(subdomain: string,phoneNumber: string) {
  const client = await getRedisClient()
  const key = keys.subBooking(subdomain,phoneNumber)
  const data  = await client.get(key)

  if (!data) {
    return null
  }

 return JSON.parse(data)

}