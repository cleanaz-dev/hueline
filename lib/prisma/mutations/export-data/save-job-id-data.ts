import { prisma } from "../../config";

interface JobParams {
  jobId: string;
  huelineId: string;
  resolution: "4k" | "8k";
  imageKeys: number;
  status: string;
}

export async function SaveJobIdData(params: JobParams) {
  const { jobId, huelineId, resolution, imageKeys, status } = params;

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
      jobId,
      booking: { connect: { id: booking.id } },
      resolution,
      imageCount: imageKeys,
      status,
    },
  });

  return exportRecord;
}
