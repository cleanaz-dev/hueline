import { prisma } from "@/lib/prisma";

/**
 * Create a log for mockup generation
 */
export async function createMockupLog(params: {
  bookingDataId: string;
  subdomainId: string;
  roomType: string;
  color: {
    ral: string;
    name: string;
    hex: string;
  };
  option: string; // The color option they selected (e.g. "lighter", "darker", "complementary")
  removeFurniture: boolean;
  s3Key?: string; // Optional - up to you if you want to store it
}) {
  const {
    bookingDataId,
    subdomainId,
    roomType,
    color,
    option,
    removeFurniture,
    s3Key,
  } = params;

  try {
    const log = await prisma.logs.create({
      data: {
        bookingDataId,
        subdomainId,
        type: "MOCKUP",
        actor: "AI",
        title: `New Mockup Generated`,
        description: `Created ${option} mockup for ${roomType} - ${color.name} (${color.ral})`,
        metadata: {
          roomType,
          color: {
            ral: color.ral,
            name: color.name,
            hex: color.hex,
          },
          option,
          removeFurniture,
          ...(s3Key && { s3Key }), // Only include s3Key if provided
        },
      },
    });

    console.log(`📝 Mockup log created: ${color.name} for ${roomType}`);
    return log;
  } catch (error) {
    console.error("❌ Failed to create mockup log:", error);
    throw error;
  }
}