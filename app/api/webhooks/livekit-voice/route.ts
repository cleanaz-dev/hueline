import {  handleLiveKitVoiceEgressEnded } from "@/lib/handlers/livekit-voice-egress-handler";
import { WebhookReceiver } from "livekit-server-sdk";
import { NextResponse } from "next/server";

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
      case "participant_joined":
        console.log("Participant Joined");
        break;

      case "participant_left":
        console.log("Participant Left");
        break;

     case "egress_ended": {
        const roomName = event.egressInfo?.roomName;
        // Grab the S3 Key (filename) instead of the full URL (location)
        const s3Key = event.egressInfo?.fileResults?.[0]?.filename;
        console.log("Egress Ended: ", roomName, s3Key)

        if (roomName && s3Key) {
          // Pass roomName and s3Key to your handler
          await handleLiveKitVoiceEgressEnded(roomName, s3Key);
        } else {
          console.warn("⚠️ egress_ended missing roomName or s3Key", {
            roomName,
            fileResults: event.egressInfo?.fileResults
          });
        }
        break;
      }

      case "room_started":
        console.log(`🚀 Room started: ${event.room?.name}`);
        break;

      case "room_finished":
        console.log(`🏁 Room finished: ${event.room?.name}`);
        break;

      default:
        console.log(`⚠️ Unhandled event: ${event.event}`);
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}
