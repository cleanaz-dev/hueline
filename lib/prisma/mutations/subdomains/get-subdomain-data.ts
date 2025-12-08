import { prisma } from "@/lib/prisma";

export async function getSubDomainData(slug: string) {
  const data = await prisma.subdomain.findUnique({
    where: { slug },
    select: {
      id: true,
      logo:true,
      companyName: true,
      logoHeight: true,
      createdAt: true,
      updatedAt: true,
      slug: true,
      projectUrl: true,
      logoWidth: true,
      splashScreen: true,
      theme: true,
      active: true,
      bookings: {
        include: {
          alternateColors: true,
          mockups: true,
          paintColors: true,
          sharedAccess: true,
        }
      }
    }
  });
  return data;
}
