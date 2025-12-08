import { prisma } from "@/lib/prisma";

export async function getBookingForPage(huelineId: string, slug: string) {
  try {
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      include: {
        subdomain: true,
        mockups: true,
        alternateColors: true,
        sharedAccess: true,
        paintColors: true,
      },
    });

    // Handle broken relations gracefully
    if (!booking) {
      console.warn(`Booking not found: ${huelineId}`);
      return null;
    }

    // CRITICAL: Check if subdomain exists
    if (!booking.subdomain) {
      console.error(`Booking ${huelineId} has missing subdomain relation`);
      return null; // Or redirect to error page
    }

    if (booking.subdomain.slug !== slug) {
      console.warn(`Slug mismatch for ${huelineId}: expected ${slug}, got ${booking.subdomain.slug}`);
      return null;
    }

    return booking;
  } catch (error) {
    console.error("Database error in getBookingForPage:", error);
    return null;
  }
}