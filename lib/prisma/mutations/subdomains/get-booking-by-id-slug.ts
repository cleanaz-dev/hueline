import { prisma } from "@/lib/prisma";

export async function getBookingByIdSlug(huelineId: string, slug: string) {
  const data = await prisma.subBookingData.findUnique({
    where: { 
      huelineId
    },
    include: {
      subdomain: true,
      mockups: true,
      alternateColors: true,
      sharedAccess: true,
      paintColors: true,
    }
  });

  // Verify the slug matches after fetching
  if (!data || data.subdomain.slug !== slug) {
    throw new Error("Booking not found or slug mismatch");
  }

  console.log("Booking:", data);
  return data;
}