import { prisma } from "@/lib/prisma";

export async function getSubDomainData(slug: string) {
  const data = await prisma.subdomain.findUniqueOrThrow({
    where: { slug },
    include: {
      bookings: {
        include: {
          alternateColors: true,
          paintColors: true,
          sharedAccess: true,
          mockups: true,
        }
      },
    }
  });
  return data;
}
