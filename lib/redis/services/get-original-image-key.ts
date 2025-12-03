import { getRedisClient, keys } from "../config";

export async function getOriginalImageS3Key(phoneNumber: string) {
  const client = await getRedisClient();
  const key = keys.booking(phoneNumber);

    const data = await client.get(key); 

  if (!data) {
    throw new Error("Booking not found");
  }

  const parsed = JSON.parse(data);

  return {
    originalImageS3Key: parsed.original_images,
    roomType: parsed.room_type
  }
}
