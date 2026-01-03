// app/api/token/[slug]/room/[roomId]/route.ts
import { AccessToken, AgentDispatchClient, RoomServiceClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug, roomId } = await params;
    
    const { searchParams } = new URL(req.url);
    const identity = searchParams.get("identity");
    
    if (!identity) {
      return NextResponse.json(
        { error: "Identity is required" },
        { status: 400 }
      );
    }

    const roomData = await prisma.room.findFirst({
      where: {
        roomKey: roomId,
        domain: {
          slug: slug,
        },
      },
      select: {
        id: true,
        roomKey: true,
        clientName: true,
        sessionType: true,
      },
    });

    if (!roomData) {
      return NextResponse.json(
        { error: "Room not found or access denied" },
        { status: 404 }
      );
    }

    const apiKey = process.env.LIVEKIT_VIDEO_API_KEY;
    const apiSecret = process.env.LIVEKIT_VIDEO_API_SECRET;
    const wsUrl = process.env.LIVEKIT_VIDEO_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error("Missing LiveKit Environment Variables");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: identity,
      metadata: JSON.stringify({
        isAgent: false,
        clientName: roomData.clientName,
        type: roomData.sessionType,
        dbId: roomData.id 
      }),
    });

    at.addGrant({
      roomJoin: true,
      room: roomData.roomKey,
      canPublish: true,
      canSubscribe: true,
    });

    // 🤖 ONLY DISPATCH AGENT IF HOST IS JOINING
    const isHost = identity.startsWith('host-');
    
    if (isHost) {
      try {
        const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);
        
        let agentInRoom = false;
        try {
          const participants = await roomService.listParticipants(roomData.roomKey);
          agentInRoom = participants.some(p => p.identity.includes('agent'));
        } catch (e) {
          // Room doesn't exist yet, agent not in room
          agentInRoom = false;
        }
        
        if (!agentInRoom) {
          const agentDispatchClient = new AgentDispatchClient(wsUrl, apiKey, apiSecret);
          await agentDispatchClient.createDispatch(
            roomData.roomKey,
            "agent",
            {
              metadata: JSON.stringify({
                clientName: roomData.clientName,
                sessionType: roomData.sessionType,
                dbId: roomData.id
              })
            }
          );
          console.log(`✅ Agent dispatched to room: ${roomData.roomKey}`);
        } else {
          console.log(`ℹ️ Agent already in room: ${roomData.roomKey}`);
        }
      } catch (dispatchError) {
        console.error("❌ Agent dispatch failed:", dispatchError);
      }
    } else {
      console.log(`ℹ️ Client joining, no agent dispatch for: ${roomData.roomKey}`);
    }

    return NextResponse.json({
      token: await at.toJwt(),
      serverUrl: wsUrl,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}