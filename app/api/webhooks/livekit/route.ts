import { WebhookReceiver, EgressStatus } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { startRoomRecording } from "@/lib/livekit/services/egress-service";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
  const body = await req.text();
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const event = await receiver.receive(body, authHeader);

    // --- HANDLE: PARTICIPANT JOINED (Start Recording) ---
    if (event.event === "participant_joined") {
      const { participant, room } = event;
      const isClient = participant?.identity?.startsWith("Client");

      if (isClient && room?.name) {
        console.log(`🎥 Client joined ${room.name}. Starting recording...`);

        const dbRoom = await prisma.room.findUnique({
          where: { roomKey: room.name },
          select: { domainId: true }
        });

        if (dbRoom?.domainId) {
          await startRoomRecording(room.name, dbRoom.domainId);
          console.log(`✅ Recording started for ${room.name}`);
        }
      }
    }

    // --- HANDLE: EGRESS ENDED (Save Recording) ---
    if (event.event === "egress_ended") {
      const { egressInfo } = event;
      const isComplete = egressInfo?.status === EgressStatus.EGRESS_COMPLETE;
      const fileData = egressInfo?.fileResults?.[0];

      if (isComplete && fileData) {
        const roomName = egressInfo.roomName;
        const s3Key = fileData.filename;

        if (s3Key && roomName) {
          console.log(`💾 Saving recording: ${s3Key} for room: ${roomName}`);

          await prisma.room.update({
            where: { roomKey: roomName },
            data: { 
              recordingUrl: s3Key,
              endedAt: new Date()
            }
          });

          console.log(`✅ Recording saved successfully`);
        }
      }
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}