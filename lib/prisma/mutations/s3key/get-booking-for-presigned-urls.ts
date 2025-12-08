import { prisma } from "@/lib/prisma";

export async function getBookingForPresignedUrls(huelineId: string, slug: string) {
  // Only fetch what we NEED for presigned URLs
  const booking = await prisma.subBookingData.findUnique({
    where: { huelineId },
    select: {
      originalImages: true,
      mockups: {
        select: {
          s3Key: true,
          id: true,
        },
      },
      subdomain: {
        select: {
          slug: true,
        },
      },
    },
  });

  // Validate slug without throwing
  if (!booking || booking.subdomain?.slug !== slug) {
    return null;
  }

  return booking;
}