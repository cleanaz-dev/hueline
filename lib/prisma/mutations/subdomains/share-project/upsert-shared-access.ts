import { prisma } from "@/lib/prisma";

export async function upsertSharedAccess(
  huelineId: string, 
  email: string, 
  accessType: string, 
  pin: string
) {
  // 1. Get the booking context
  const booking = await prisma.subBookingData.findUnique({
    where: { huelineId },
    select: { id: true }
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // 2. Check if Access already exists for this email
  const existingAccess = await prisma.sharedAccess.findFirst({
    where: {
      bookingDataId: booking.id,
      email: email,
    }
  });

  // 3. Upsert Logic
  if (existingAccess) {
    // UPDATE permissions
    return await prisma.sharedAccess.update({
      where: { id: existingAccess.id },
      data: {
        accessType: accessType,
        pin: pin, 
      }
    });
  } else {
    // CREATE new access
    return await prisma.sharedAccess.create({
      data: {
        bookingDataId: booking.id,
        email: email,
        accessType: accessType,
        pin: pin,
      }
    });
  }
}