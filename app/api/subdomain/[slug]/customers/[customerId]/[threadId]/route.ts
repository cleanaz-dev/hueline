import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// 1. IMPORT YOUR UTILITY HERE:
import { getPresignedUrl } from "@/lib/aws/s3";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ customerId: string; slug: string; threadId: string }>;
  },
) {
  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (!user || !user.email) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }
  const { customerId, slug, threadId } = await params;

  // check if data belongs to fetcher
  const isUserValid = await prisma.subdomain.findFirst({
    where: {
      slug,
      users: {
        some: {
          email: user?.email,
        },
      },
    },
  });

  if (!isUserValid) {
    return NextResponse.json({ message: "Access Denied" }, { status: 401 });
  }

  try {
    // 1. Fetch Communications WITH their attachments
    const rawCommunications = await prisma.clientCommunication.findMany({
      where: {
        customerId,
        chatThreadId: threadId,
      },
      include: {
        mediaAttachments: true,
      },
    });

    // 2. MAGIC STEP: Pre-sign the URLs before sending to the client
    // We use Promise.all to map over the comms concurrently
    const communications = await Promise.all(
      rawCommunications.map(async (comm) => {
        const processedAttachments = await Promise.all(
          comm.mediaAttachments.map(async (attachment) => {
            // Only generate presigned URL if the source is S3
            if (attachment.mediaSource === "S3") {
              const presignedUrl = await getPresignedUrl(attachment.mediaUrl);
              return {
                ...attachment,
                mediaUrl: presignedUrl, // Replace the raw key with the temporary URL
              };
            }
            // If it's EXTERNAL (or something else), just leave it as is
            return attachment;
          }),
        );

        return {
          ...comm,
          mediaAttachments: processedAttachments,
        };
      }),
    );

    // 3. Fetch Activities
    const activities = await prisma.clientActivity.findMany({
      where: { customerId, chatThreadId: threadId },
    });

    // 4. Map Activities to match the Communication shape
    const mappedActivities = activities.map((act) => ({
      id: act.id,
      role: "SYSTEM",
      type: "ACTIVITY",

      activityType: act.type,
      body: act.title || act.type.replace(/_/g, " "),
      description: act.description,
      metadata: act.metadata,
      createdAt: act.createdAt,
      mediaAttachments: [],
    }));

    // 5. Merge and Sort chronologically
    const timeline = [...communications, ...mappedActivities].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return NextResponse.json(timeline);
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { message: "Internal Server Error:", error },
      { status: 500 },
    );
  }
}
