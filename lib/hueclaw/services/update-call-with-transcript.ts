import { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getTranscript } from "@/lib/redis";

export async function updateCallwithTranscript(callId: string) {
  const transcript = await getTranscript(callId);

  if (!transcript || transcript.length === 0) {
    console.warn(
      `ℹ️ [RoomEnded] No transcript lines found in Redis for Call ID: ${callId}`,
    );
  }

  const callTranscript = await prisma.call.update({
    where: { id: callId },
    data: {
      transcript: transcript as unknown as Prisma.InputJsonValue,
      status: "ENDED",
    },
    select: {
      transcript: true,
    },
  });

  console.log(
    `✅ [RoomEnded] Saved complete transcript for Call ID: ${callId}`,
  );

  return { transcript: callTranscript.transcript };
}
