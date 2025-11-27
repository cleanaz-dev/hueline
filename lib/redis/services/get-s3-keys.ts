import { getRedisClient, keys } from "../config";

export async function getImageKeys(phoneNumber: string) {
  const client = await getRedisClient();
  const key = keys.sentImages(phoneNumber);
  const data = await client.get(key);
  
  if (!data) {
    return [];
  }
  
  return JSON.parse(data) as { s3_key: string }[];
}