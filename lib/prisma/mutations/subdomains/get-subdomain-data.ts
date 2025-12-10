import { prisma } from "@/lib/prisma";

export async function getSubDomainData(slug: string) {
  return await prisma.subdomain.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      companyName: true,
      projectUrl: true,
      logo: true,
      logoWidth: true,
      logoHeight: true,
      splashScreen: true,
      theme: true,
      active: true,
      
      // Add these missing fields:
      twilioPhoneNumber: true,
      forwardingNumber: true,
      planStatus: true,
      planName: true,
      currentPeriodEnd: true,
      stripeCustomerId: true,
      
      createdAt: true,
      updatedAt: true,
      
      bookings: {
        include: {
          mockups: true,
          paintColors: true,
          alternateColors: true,
          sharedAccess: true,
        }
      },
      
      // Add users relation:
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          imageUrl: true
        }
      }
    }
  });
}
