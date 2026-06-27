import { prisma } from "@/lib/prisma";

export async function getSubDomainAccount(slug: string) {
  const data = await prisma.subdomain.findUnique({
    where: { slug },
    include: {
      branding: true,
    },
  });

  return data;
}
