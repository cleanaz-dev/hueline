import { prisma } from "@/lib/prisma";

export async function createSharedProjectLog(params: {
  huelineId: string;
  slug: string;
  recipients: string[]; // List of emails
  accessType: string;   // 'customer' or 'viewer'
}) {
  const { huelineId, slug, recipients, accessType } = params;

  try {
    // 1. Resolve IDs needed for relations
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

    if (!subdomain || !booking) {
      console.warn(`⚠️ Log Skipped: Missing ID for slug:${slug} or hue:${huelineId}`);
      return;
    }

    // 2. Create Log
    await prisma.logs.create({
      data: {
        bookingDataId: booking.id,
        subdomainId: subdomain.id,
        type: "SHARE", 
        actor: "CLIENT", // Hardcoded as requested
        title: "Project Shared",
        description: `Shared with ${recipients.length} people (${accessType}): ${recipients.join(", ")}`,
        metadata: {
          action: "SHARE_PROJECT",
          recipients: recipients,
          accessType: accessType,
          authMethod: "PIN/CLIENT"
        },
      },
    });

    console.log(`📝 Shared Project log created for ${huelineId}`);
  } catch (error) {
    console.error("❌ Failed to create share log:", error);
  }
}