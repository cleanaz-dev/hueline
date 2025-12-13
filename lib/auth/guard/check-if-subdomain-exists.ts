import { prisma } from "@/lib/prisma";

export async function checkSubdomainExists(slug: string): Promise<boolean> {
  if (!slug) return false;

  try {
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true }, // minimal + fast
    });

    return !!subdomain;
  } catch {
    console.warn(`⛔ Subdomain Does Not Exist`);
    return false;
  }
}
