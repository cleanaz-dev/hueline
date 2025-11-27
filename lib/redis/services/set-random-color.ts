import { getRedisClient, keys } from "../config";

interface RandomColor {
  ral: string;
  hex: string;
  name: string;
}

export async function setRandomColor(phoneNumber: string, randomColor: RandomColor) {
  const client = await getRedisClient();
  const key = keys.booking(phoneNumber);
  const existingData = await client.get(key);

  if (!existingData) {
    return null;
  }

  const bookingData = JSON.parse(existingData);

  // Store directly (clean shape)
  bookingData.random_color = randomColor;

  await client.set(key, JSON.stringify(bookingData));

  return bookingData;
}
