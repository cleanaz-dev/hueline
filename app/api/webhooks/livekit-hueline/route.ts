// api/webhooks/livekit-hueline/route.ts
import { WebhookReceiver } from "livekit-server-sdk";
import { handleParticipantJoined } from "@/lib/livekit";
import { handleParticipantLeft } from "@/lib/livekit"
import { handleEgressEnded } from "@/lib/livekit";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_VIDEO_API_KEY!,
  process.env.LIVEKIT_VIDEO_API_SECRET!
);

export async function POST(req: Request) {
  const body = await req.text();
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const event = await receiver.receive(body, authHeader);

    console.log(`📥 Webhook Event: ${event.event}`);

    // Route to handlers based on event type
    switch (event.event) {
      case "participant_joined":
        await handleParticipantJoined(event);
        break;

      case "participant_left":
        await handleParticipantLeft(event);
        break;

      case "egress_ended":
        await handleEgressEnded(event);
        break;

      case "room_started":
        console.log(`🚀 Room started: ${event.room?.name}`);
        break;

      case "room_finished":
        console.log(`🏁 Room finished: ${event.room?.name}`);
        break;

      default:
        console.log(`ℹ️ Unhandled event: ${event.event}`);
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}