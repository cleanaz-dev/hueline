import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/aws/s3/services";

export async function getSubDomainData(slug: string) {
  const data = await prisma.subdomain.findUnique({
    where: { slug },
    include: {
      rooms: true,
      logs: true,
      bookings: {
        include: {
          mockups: true,
          paintColors: true,
          alternateColors: true,
          sharedAccess: true,
          exports: {
            orderBy: { createdAt: "desc" },
          },
          logs: true,
          calls: {
            include: { intelligence: true },
            orderBy: { createdAt: "desc" },
          },
          rooms: true,
        },
        orderBy: { createdAt: "desc" },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          imageUrl: true,
        },
      },
      client: {
        select: {
          id: true,
          firstName: true,
          planPrice: true,
          planStatus: true,
          planName: true,
          currentPeriodEnd: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
        },
      },
    },
  });

  if (!data) return null;

  // Collect all S3 keys
  const keysToSign = new Set<string>();
  data.bookings.forEach((b) => {
    if (b.compressOriginalImages) keysToSign.add(b.compressOriginalImages);
    b.mockups.forEach((m) => {
      if (m.compressedS3Key) keysToSign.add(m.compressedS3Key);
    });
  });

  // Presign all in parallel
  const urlMap: Record<string, string> = {};
  await Promise.all(
    Array.from(keysToSign).map(async (key) => {
      urlMap[key] = await getPresignedUrl(key);
    })
  );

  // Return enriched bookings
  return {
    ...data,
    bookings: data.bookings.map((b) => ({
      ...b,
      originalImages: urlMap[b.compressOriginalImages!] ?? b.originalImages,
      mockups: b.mockups.map((m) => ({
        ...m,
        presignedUrl: urlMap[m.compressedS3Key!] ?? m.presignedUrl,
      })),
    })),
  };
}