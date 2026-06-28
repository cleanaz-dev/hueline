// app/api/livekit/webhook/route.ts (or wherever this lives)

import { WebhookReceiver } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { handleLiveKitVoiceEgressEnded } from "@/lib/handlers/livekit-voice-egress-handler";
import { handleLiveKitVoiceRoomEnded } from "@/lib/handlers/livekit-voice-room-ended";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

export async function POST(req: Request) {
  const body = await req.text();
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized Request" },
      { status: 401 },
    );
  }

  try {
    const event = await receiver.receive(body, authHeader);

    console.log(`📥 Webhook Event: ${event.event}`);

    switch (event.event) {
      /* ============================================================
       * PARTICIPANT JOINED
       * Fires when any participant (agent or user) joins a room.
       * ============================================================ */
      case "participant_joined":
        console.log("Participant Joined");
        break;

      /* ============================================================
       * PARTICIPANT LEFT
       * Fires when any participant (agent or user) leaves a room.
       * ============================================================ */
      case "participant_left":
        console.log("Participant Left");
        break;

      /* ============================================================
       * EGRESS ENDED
       * Fires when a recording/egress job finishes and the file
       * has been uploaded to S3. Triggers transcription pipeline.
       * ============================================================ */
      case "egress_ended": {
        const roomName = event.egressInfo?.roomName;
        const s3Key = event.egressInfo?.fileResults?.[0]?.filename;
        console.log("Egress Ended: ", roomName, s3Key);

        if (roomName && s3Key) {
          const pathParts = s3Key.split("/");
          const callId = pathParts.length > 1 ? pathParts[1] : null;

          if (callId) {
            await handleLiveKitVoiceEgressEnded(roomName, s3Key, callId);
          } else {
            console.warn("⚠️ Could not extract callId from s3Key:", s3Key);
          }
        } else {
          console.warn("⚠️ egress_ended missing roomName or s3Key", {
            roomName,
            fileResults: event.egressInfo?.fileResults,
          });
        }
        break;
      }

      /* ============================================================
       * ROOM STARTED
       * Fires when a new room is created and becomes active.
       * ============================================================ */
      case "room_started":
        console.log(`🚀 Room started: ${event.room?.name}`);
        break;

      /* ============================================================
       * ROOM FINISHED
       * Fires when all participants have left and the room closes.
       * Triggers any post-call cleanup logic.
       * ============================================================ */
      case "room_finished": {
        const roomName = event.room?.name;
        console.log(`🏁 Room finished: ${roomName}`);

        if (roomName) {
          await handleLiveKitVoiceRoomEnded(roomName);
        }
        break;
      }

      /* ============================================================
       * DEFAULT — UNHANDLED EVENTS
       * ============================================================ */
      default:
        console.log(`⚠️ Unhandled event: ${event.event}`);
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}