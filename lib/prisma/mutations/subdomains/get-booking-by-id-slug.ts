import { prisma } from "@/lib/prisma";

export async function getBookingByIdSlug(huelineId: string, slug: string) {
  const data = await prisma.subBookingData.findUniqueOrThrow({
    where: { 
      huelineId,
      subdomain: { slug }
     },
     select: {
      mockups: true,
      originalImages: true
     }
  });
  return data;
}