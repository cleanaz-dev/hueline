import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// 1. IMPORT YOUR UTILITY HERE:
import { getPresignedUrl } from "@/lib/aws/s3";
import { getTimelineCache, setTimelineCache } from "@/lib/redis/agent-context";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ customerId: string; slug: string; threadId: string }>;
  }
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

  // 2. CHECK CACHE FIRST
  try {
    const cachedTimeline = await getTimelineCache(slug, threadId);
    if (cachedTimeline) {
      return NextResponse.json(cachedTimeline);
    }
  } catch (e) {
    console.error("Redis fetch failed, falling back to DB", e);
  }

  // 3. FETCH FROM DB IF NOT IN CACHE
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
            if (attachment.mediaSource === "S3") {
              const isImage = attachment.mimeType.startsWith("image/");
              const keyToSign =
                isImage && attachment.compressedKey
                  ? attachment.compressedKey
                  : attachment.mediaUrl; // mediaUrl is already the raw S3 key

              const presignedUrl = await getPresignedUrl(keyToSign);
              return {
                ...attachment,
                mediaUrl: presignedUrl,
              };
            }
            return attachment;
          })
        );

        return {
          ...comm,
          mediaAttachments: processedAttachments,
        };
      })
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

    const followUp = await prisma.followUpSchedule.findFirst({
      where: { chatThreadId: threadId, status: "PENDING" },
    });

    const mappedFollowUps = followUp
      ? [
          {
            id: followUp.id,
            role: "SYSTEM",
            type: "FOLLOW_UP",
            activityType: "FOLLOW_UP",
            body: followUp.title,
            description: `Follow-up scheduled for ${followUp.triggerAt.toISOString()}`,
            metadata: {
              reason: followUp.reason,
              scheduleName: followUp.scheduleName,
              triggerAt: followUp.triggerAt,
              status: followUp.status,
            },
            createdAt: followUp.createdAt,
            mediaAttachments: [],
          },
        ]
      : [];

    const rawCalls = await prisma.call.findMany({
      where: { customerId, threadId: threadId },
    });

    const mappedCalls = rawCalls.map((call) => ({
      id: call.id,
      // INBOUND = Client side (right), OUTBOUND = Operator/AI side (left)
      role: call.callDirection === "INBOUND" ? "CLIENT" : "OPERATOR",
      type: "PHONE",
      activityType: "CALL", // Optional fallback
      body:
        call.status === "PROCESSING"
          ? "Live Call in Progress..."
          : "Call Ended",
      description: `Call ID: ${call.callSid}`,
      metadata: {
        status: call.status,
        callDirection: call.callDirection,
        audioUrl: call.audioUrl,
        duration: call.duration,
        roomName: call.roomName,
      },
      createdAt: call.createdAt,
      mediaAttachments: [],
    }));

    // 5. Merge and Sort chronologically
    const timeline = [
      ...communications,
      ...mappedActivities,
      ...mappedFollowUps,
      ...mappedCalls, // <-- Add calls to the merge
    ].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 6. SET THE CACHE WITH OUR NEW UTILITY (No double stringifying!)
    await setTimelineCache(slug, threadId, timeline);

    return NextResponse.json(timeline);
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json(
      { message: "Internal Server Error:", error },
      { status: 500 }
    );
  }
}

