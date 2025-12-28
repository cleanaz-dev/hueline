import { prisma } from "../../config";

export async function getOwnerData(slug: string) {
  const subdomain = await prisma.subdomain.findUnique({
    where: { slug },
    include: {
      callFlows: true,
      intelligence: true,
      logs: true,
      users: true,
      rooms: {
        include: {
          domain: true,
          creator: true,
          booking: {
            include: {
              mockups: true,
            },
          },
        },
      },
      roomIntelligence: true,
      bookings: {
        include: {
          mockups: true,
          paintColors: true,
          alternateColors: true,
          sharedAccess: true,
          exports: true,
          calls: {
            include: {
              intelligence: true,
            },
          },
          logs: true,
          rooms: true,
        },
      },
      calls: {
        include: {
          intelligence: true,
          bookingData: {
            include: {
              mockups: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  if (!subdomain) return null;

  return subdomain;
}
