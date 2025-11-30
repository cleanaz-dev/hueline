import { getRedisClient, keys } from "../config";
import { BookingParams } from "@/types/booking-type";

export async function setBooking(
  phoneNumber: string,
  booking: BookingParams
) {
  const client = await getRedisClient();
  const key = keys.booking(phoneNumber);
  await client.set(key, JSON.stringify(booking));

  return true
}