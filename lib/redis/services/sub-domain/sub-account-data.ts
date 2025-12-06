import { getRedisClient, keys } from "@/lib/redis";
import { SubdomainAccountData } from "@/types/subdomain-type";

export async function getSubAccountData(slug: string): Promise<SubdomainAccountData | null> {
  const client = await getRedisClient();
  const key = keys.slug(slug);
  const data = await client.get(key);

  if (!data) {
    return null;
  }
  
  return JSON.parse(data);
}

export async function setSubAccountData(
  slug: string,
  data: SubdomainAccountData
): Promise<boolean> {
  const client = await getRedisClient();
  const key = keys.slug(slug);
  await client.setEx(key, 21600, JSON.stringify(data));
  return true;
}