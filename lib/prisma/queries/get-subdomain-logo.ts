import { getPublicUrl } from "@/lib/aws/cdn";
import { prisma } from "../config";

export async function getSubdomainLogo(slug: string) {
  try {
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: {
        branding: {
          select: {
            logoUrl: true,
          },
        },
      },
    });

    if (!subdomain?.branding?.logoUrl) return null;

    return subdomain?.branding.logoUrl
      ? getPublicUrl(subdomain.branding.logoUrl)
      : null;
  } catch (error) {
    console.error("Failed to fetch logo:", error);
    return null;
  }
}
