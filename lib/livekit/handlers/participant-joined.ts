// lib/livekit/handlers/participant-joined.ts
import { WebhookEvent } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { startRoomRecording } from "@/lib/livekit/services/egress-service";
import { AgentDispatchClient } from "livekit-server-sdk";

export async function handleParticipantJoined(event: WebhookEvent) {
  const { participant, room } = event;

  if (!participant?.identity || !room?.name) return;

  const isHost = participant.identity.startsWith("host-");

  console.log(`👤 ${participant.identity} joined ${room.name}`);

  if (isHost) {
    // Get room data from DB
    const roomData = await prisma.room.findUnique({
      where: { roomKey: room.name },
      select: {
        id: true,
        domainId: true,
        clientName: true,
        sessionType: true,
        agentDispatched: true,
      },
    });

    if (!roomData) {
      console.error(`❌ Room not found in DB: ${room.name}`);
      return;
    }

    // Dispatch agent if not already dispatched
    if (!roomData.agentDispatched) {
      console.log(`🤖 Host joined, dispatching agent for ${room.name}`);

      const apiKey = process.env.LIVEKIT_VIDEO_API_KEY!;
      const apiSecret = process.env.LIVEKIT_VIDEO_API_SECRET!;
      const wsUrl = process.env.LIVEKIT_VIDEO_URL!;

      try {
        const agentDispatchClient = new AgentDispatchClient(
          wsUrl,
          apiKey,
          apiSecret
        );

        await agentDispatchClient.createDispatch(
          room.name, // ✅ This is the room identifier
          "agent",
          {
            metadata: JSON.stringify({
              clientName: roomData.clientName,
              sessionType: roomData.sessionType,
              dbId: roomData.id,
              roomKey: room.name, // ⬅️ ADD THIS so the agent knows the room identifier
            }),
          }
        );

        // Mark as dispatched
        await prisma.room.update({
          where: { id: roomData.id },
          data: { agentDispatched: true },
        });

        console.log(`✅ Agent dispatched for room: ${room.name}`);
      } catch (error) {
        console.error(`❌ Agent dispatch failed for ${room.name}:`, error);
      }
    } else {
      console.log(`🆔 Agent already dispatched for ${room.name}`);
    }

    // Start recording
    console.log(`🎥 Host joined ${room.name}. Starting recording...`);

    if (roomData.domainId) {
      await startRoomRecording(room.name, roomData.domainId);
      console.log(`✅ Recording started for ${room.name}`);
    }
  }
}
