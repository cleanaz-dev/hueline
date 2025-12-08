import { getPresignedUrl } from "@/lib/aws/s3"
import { prisma } from "@/lib/prisma"


export async function getOriginalImageUrl(huelineId:string) {
  const data = await prisma.subBookingData.findFirstOrThrow({
    where: {
      huelineId
    },
    select: {
      originalImages: true,
      roomType: true
    }
  })

  const url = await getPresignedUrl(data.originalImages)

  return {
    originalImageUrl: url, 
    roomType: data.roomType
  }
};