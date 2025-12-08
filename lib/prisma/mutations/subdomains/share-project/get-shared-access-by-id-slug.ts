import { prisma } from "@/lib/prisma";

export async function getSharedAccessByIdSlug(huelineId: string, slug: string) {
  const data = await prisma.subBookingData.findFirstOrThrow({
    where: {
      huelineId: huelineId,
      AND: {
        subdomain: { slug },
      },
    },
    select: {
      id: true,
      sharedAccess: {
        select: {
          accessType: true,
          email: true,
          id: true,
        }
      },
    },
  });

  return data;
}
