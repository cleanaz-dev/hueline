import { getRedisClient, keys } from "../config";

export async function getBooking(phoneNumber: string) {
  const client = await getRedisClient();
  const key = keys.booking(phoneNumber);
  const data = await client.get(key);

  if (!data) {
    return null;
  }
  
  return JSON.parse(data);
}
