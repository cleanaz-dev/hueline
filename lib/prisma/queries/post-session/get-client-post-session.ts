import { prisma } from "../../config";

export async function getClientPostSession(huelineId: string, roomId: string) {
  const data = await prisma.subBookingData.findFirst({
    where: {
      huelineId,
      rooms: {
        some: { roomKey: roomId },
      },
    },
    include: {
      paintColors: true,
      mockups: true,
      rooms: true,
    },
  });

  if(!data) return null
  
  return data;
}
