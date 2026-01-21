import { prisma } from "@/lib/prisma";

// 👇 Update the params interface here
export async function createSharedProjectLog(params: {
  huelineId: string;
  slug: string;
  recipients: string[];
  accessType: string;
  actor: "CLIENT" | "PAINTER" | "SYSTEM"; // <--- ADD THIS LINE
}) {
  const { huelineId, slug, recipients, accessType, actor } = params;

  try {
    const [subdomain, booking] = await Promise.all([
      prisma.subdomain.findUnique({ 
        where: { slug }, 
        select: { id: true } 
      }),
      prisma.subBookingData.findUnique({ 
        where: { huelineId }, 
        select: { id: true } 
      })
    ]);

    if (!subdomain || !booking) return;

    await prisma.logs.create({
      data: {
        bookingDataId: booking.id,
        subdomainId: subdomain.id,
        type: "SHARE", 
        actor: actor, // <--- Now this will work
        title: "Project Shared",
        description: `Shared with ${recipients.length} people (${accessType}): ${recipients.join(", ")}`,
        metadata: {
          action: "SHARE_PROJECT",
          recipients: recipients,
          accessType: accessType,
        },
      },
    });
  } catch (error) {
    console.error("❌ Failed to create share log:", error);
  }
}