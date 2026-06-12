import { SystemTask } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { HueClawImagenResultPaylod } from "@/lib/zod/hueclaw/imagen/imagen-result-payload";
import { HueClawImageMetadata } from "@/lib/zod/imagen-metadata/hueclaw-imagen-metadata";

export async function handleHueClawImagenReturn(
  result: HueClawImagenResultPaylod,
  metadata: HueClawImageMetadata,
  task: SystemTask,
) {
  try {
    const booking = await prisma.subBookingData.findUnique({
      where: {
        huelineId: metadata.huelineId,
      },
    });

    await prisma.subBookingData.update({
      where: { id: booking?.id },
      data: {
        mockups: {
          create: {
            brand: result.selectedColorBrand,
            code: result.selectedColorCode,
            name: result.selectedColorName,
            hex: result.selectedColorHex,
            compressedS3Key: result.compressedS3Key,
            s3Key: result.newImagenS3Key,
            roomType: metadata.roomType,
          },
        },
        paintColors: {
          create: {
            brand: result.selectedColorBrand,
            code: result.selectedColorCode,
            name: result.selectedColorName,
            hex: result.selectedColorHex,
          },
        },
      },
    });

    
  } catch (error) {
    console.error(error)
  }
}
