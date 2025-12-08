import { prisma } from "@/lib/prisma";

export async function getBookingByIdSlug(huelineId: string, slug: string) {
  const data = await prisma.subdomain.findUniqueOrThrow({
    where: { slug },
    select: {
      slug: true,
      companyName: true,
      logo: true,
      logoWidth: true,
      logoHeight: true,
      splashScreen: true,
      theme: true,
      projectUrl: true,
      id:true,
      createdAt:true,
      active: true,
      updatedAt: true,
      bookings: {
        where: { huelineId },
        include: {
          alternateColors: true,
          mockups: true,
          paintColors: true,
          sharedAccess: true,
        },
      },
    },
  });
  return data;
}