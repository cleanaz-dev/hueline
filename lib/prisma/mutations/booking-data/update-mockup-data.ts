import { prisma } from "@/lib/prisma";

interface ColorParams {
  name: string;
  hex: string;
  ral: string;
}

export async function updateMockupData(
  huelineId: string,
  s3Key: string,
  colorChoice: ColorParams,
  roomType: string
) {
  // 1. Get the internal Mongo ID first
  const booking = await prisma.subBookingData.findUnique({
    where: { huelineId },
    select: { id: true },
  });

  if (!booking) throw new Error("Booking not found");

  // 2. Create the Mockup directly
  const newMockup = await prisma.mockup.create({
    data: {
      bookingData: { connect: { id: booking.id } }, // Link using internal ID
      roomType,
      s3Key,
      colorHex: colorChoice.hex,
      colorRal: colorChoice.ral,
      colorName: colorChoice.name,
    },
  });

  const newPaintColor = await prisma.paintColor.create({
    data: {
      bookingData: {connect: {id: booking.id }},
      hex: colorChoice.hex,
      name: colorChoice.name,
      ral: colorChoice.ral,
    }
  })

  return newMockup.id; // 🟢 Returns the specific Mockup ID
}
