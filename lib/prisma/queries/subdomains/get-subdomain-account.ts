import { prisma } from "@/lib/prisma";

export async function getSubDomainAccount(slug: string) {
  const data = await prisma.subdomain.findUniqueOrThrow({
    where: { slug },
  });

  return data;
}
