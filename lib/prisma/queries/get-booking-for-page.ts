import { prisma } from "@/lib/prisma";

export async function getBookingForPage(huelineId: string, slug: string) {
  try {
    // 🔥 FIX: Use findFirst with mode: 'insensitive'
    const booking = await prisma.subBookingData.findFirst({
      where: { 
        huelineId: {
          equals: huelineId,
          mode: 'insensitive', // This fixes the HL-123 vs hl-123 issue
        }
      },
      include: {
        subdomain: {
          include:{
            users: true
          }
        },
        calls: {
          include: {
            intelligence: true,
          }
        },
        mockups: true,
        alternateColors: true,
        sharedAccess: true,
        paintColors: true,
        exports: true,
        logs: true
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
      return null; 
    }

    // 🔥 FIX: Case insensitive slug check
    if (booking.subdomain.slug.toLowerCase() !== slug.toLowerCase()) {
      console.warn(`Slug mismatch for ${huelineId}: expected ${slug}, got ${booking.subdomain.slug}`);
      return null;
    }

    return booking;
  } catch (error) {
    console.error("Database error in getBookingForPage:", error);
    return null;
  }
}