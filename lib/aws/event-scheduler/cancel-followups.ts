import { prisma } from "@/lib/prisma";
import { deleteAWSSchedule } from ".";
import { invalidateThreadCache } from "@/lib/redis/agent-context";

export async function cancelPendingFollowUp(threadId: string) {
  try {
    const schedule = await prisma.followUpSchedule.findFirst({
      where: { chatThreadId: threadId, status: "PENDING" },
      select: {
        id: true,
        scheduleName: true,
        subdomain: {
          select: {
            slug: true,
          }
        }
      }
    });

    if (!schedule) return;

    if (schedule.scheduleName) {
      await deleteAWSSchedule(schedule.scheduleName);
    }

    await prisma.followUpSchedule.update({
      where: { id: schedule.id },
      data: { status: "CANCELLED" },
    });

    await invalidateThreadCache(schedule.subdomain.slug,threadId)

    console.log(`[Cancel Nudge] ✅ Cancelled follow-up for thread ${threadId}`);
  } catch (error) {
    console.error(
      `[Cancel Nudge Error] Failed to cancel for thread ${threadId}:`,
      error,
    );
  }
}
