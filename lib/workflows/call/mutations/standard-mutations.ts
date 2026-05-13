import { prisma } from "@/lib/prisma";

// ─── Basic Call Update (UNCOMPLETED_CALL path) ────────────────────────────────
// Used when there is no booking or hueline — just stamp what we have.

interface UpdateCallBasicArgs {
  callSid: string;
  recordingUrl: string;
  duration?: number;
}

export async function updateCallBasic({
  callSid,
  recordingUrl,
  duration,
}: UpdateCallBasicArgs) {
  return prisma.call.update({
    where: { callSid },
    data: {
      audioUrl: recordingUrl,
      status: "completed",
      ...(duration !== undefined && { duration: String(duration) }),
    },
  });
}