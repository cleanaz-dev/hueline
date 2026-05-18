import { prisma } from "@/lib/prisma";
import { generateHuelineId, generatePin } from "@/lib/hueline/generate";
import { generateVisionSummary } from "@/lib/hueline/vision-summary";
import { getPresignedUrl } from "@/lib/aws/s3";

interface BookingProps {
  colorBrand: string;
  colorName: string;
  colorCode: string;
  colorHex: string;
  roomType: string;
  originalImageS3Key: string;
  newImagenS3Key: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  subdomainId: string;
  designId: string;
}

export async function createNewSubBooking({
  colorBrand,
  colorName,
  colorCode,
  colorHex,
  roomType,
  originalImageS3Key,
  newImagenS3Key,
  customerName,
  customerPhone,
  subdomainId,
  designId,
}: BookingProps) {
  const huelineId = generateHuelineId();
  const pin = generatePin();

    const originalImageUrl = await getPresignedUrl(originalImageS3Key)
    const newImagenUrl = await getPresignedUrl(newImagenS3Key)

  await generateVisionSummary({
    originalImageUrl,
    newImagenUrl,
  })

  const subBookingData = await prisma.subBookingData.create({
    data: {
      huelineId,
      pin,
      phone: customerPhone,
      name: customerName,
      subdomain: { connect: { id: subdomainId } },
      prompt: `${colorBrand} ${colorName} would you great in my ${roomType}!`,
      summary: ``,
      originalImages: originalImageS3Key,
      roomType,
      status: "PENDING",
      designProjects: { connect: { id: designId } },
      mockups: {
        create: {
          s3Key: newImagenS3Key,
          brand: colorBrand,
          name: colorName,
          code: colorCode,
          hex: colorHex,
          roomType,
          designProject: { connect: { id: designId } },
        },
      },
      paintColors: {
        create: {
          brand: colorBrand,
          name: colorName,
          code: colorCode,
          hex: colorHex,
        },
      },
    },
  });

  return subBookingData;
}
