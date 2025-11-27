import { getRedisClient, keys } from "@/lib/redis";

export async function getSubBooking(subdomain: string,phoneNumber: string) {
  const client = await getRedisClient()
  const key = keys.subBooking(subdomain,phoneNumber)
  const data  = await client.get(key)

  if (!data) {
    return null
  }

 return JSON.parse(data)

}