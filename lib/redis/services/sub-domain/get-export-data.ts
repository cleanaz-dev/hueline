import { getRedisClient, keys } from "@/lib/redis";

export async function getExportDataRedis(jobId: string) {
  const client = await getRedisClient()
  const key = keys.export(jobId)

  const data = await client.get(key)

  if(!data) 
    return null

  return JSON.parse(data)
}