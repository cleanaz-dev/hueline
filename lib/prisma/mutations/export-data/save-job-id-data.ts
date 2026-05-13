import { prisma } from "../../config";

interface JobParams {
  systemTaskId: string;
  huelineId: string;
  resolution: "4k" | "8k";
  imageKeys: number;
  status: string;
}

export async function SaveJobIdData(params: JobParams) {
  const { systemTaskId, huelineId, resolution, imageKeys, status } = params;

  // First, get the booking by huelineId to get the bookingId
  const booking = await prisma.subBookingData.findUnique({
    where: { huelineId },
    select: { id: true },
  });

  if (!booking) {
    throw new Error(`Booking not found for huelineId: ${huelineId}`);
  }

  const exportRecord = await prisma.export.create({
    data: {
      systemTaskId,
      booking: { connect: { id: booking.id } },
      resolution,
      imageCount: imageKeys,
      status,
    },
  });

  return exportRecord;
}
