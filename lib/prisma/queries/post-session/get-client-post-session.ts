import { prisma } from "../../config";
import { getPresignedUrl } from "@/lib/aws/s3";

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
      rooms: {
        where: {
          roomKey: roomId
        }
      },
    },
  });

  if(!data) return null;
  
  const { rooms, ...bookingData } = data;
  
  // Generate presigned URLs
  const presignedUrls: Record<string, string> = {};
  const scopeData = rooms[0]?.scopeData as Record<string, any>;

  if (scopeData) {
    for (const key in scopeData) {
      const item = scopeData[key];
      if (item.upscaledKey) {
        presignedUrls[item.upscaledKey] = await getPresignedUrl(item.upscaledKey);
      }
      if (item.image_urls && Array.isArray(item.image_urls)) {
        for (const s3Key of item.image_urls) {
          if (!presignedUrls[s3Key]) {
            presignedUrls[s3Key] = await getPresignedUrl(s3Key);
          }
        }
      }
    }
  }

  if (data.mockups) {
    for (const mockup of data.mockups) {
      if (mockup.s3Key && !presignedUrls[mockup.s3Key]) {
        presignedUrls[mockup.s3Key] = await getPresignedUrl(mockup.s3Key);
      }
    }
  }
  
  return {
    booking: bookingData,
    room: rooms[0],
    presignedUrls
  };
}