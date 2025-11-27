import { getRedisClient, keys, logWithTime } from "../config";


export async function pushImageKey(phoneNumber: string, s3Key: string, expirationSeconds = 3600) {
  const client = await getRedisClient();
  const key = keys.sentImages(phoneNumber);
  const list = JSON.parse(await client.get(key) || "[]") as { s3_key: string, uploaded_at: string }[];
  
  list.push({
    s3_key: s3Key,
    uploaded_at: new Date().toISOString()
  });
  
  await client.setEx(key, expirationSeconds, JSON.stringify(list));
  logWithTime(`✅ Pushed 1 S3 key for ${phoneNumber}`);
}