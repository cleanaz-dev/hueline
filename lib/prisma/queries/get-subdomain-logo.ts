import { getPublicUrl } from "@/lib/aws/cdn";
import { prisma } from "../config";

export async function getSubdomainLogo(slug: string) {
  try {
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { logo: true }
    });
    
    return subdomain?.logo ? getPublicUrl(subdomain.logo) : null;
  } catch (error) {
    console.error("Failed to fetch logo:", error);
    return null;
  }
}