import { getRedisClient, keys } from "../config";

interface ColorParams {
  ral: string;
  name: string;
  hex: string;
}

export async function updateBookingWithMockData(
  s3Key: string,
  roomType: string,
  color: ColorParams,
  phoneNumber: string,
  presignedUrl?: string
) {
  const client = await getRedisClient();
  const key = keys.booking(phoneNumber);

  const bookingRaw = await client.get(key);
  if (!bookingRaw) throw new Error("Booking not found");

  const booking = JSON.parse(bookingRaw);

  // 🚀 Push to mockup_urls array
  booking.mockup_urls.push({
    s3_key: s3Key,
    room_type: roomType,
    color,
    presigned_url: presignedUrl,
  });

  // 🚀 Push to paint_colors array
  booking.paint_colors.push(color);

  // Save back to Redis
  await client.set(key, JSON.stringify(booking));

  return booking;
}
