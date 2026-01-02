// app/api/token/[slug]/room/[roomId]/route.ts
import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";
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
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // 1. DB Query: Match "roomKey" (string) instead of "id" (ObjectId)
    const roomData = await prisma.room.findFirst({
      where: {
        roomKey: roomId, // Matches 'test-01022026-1972'
        domain: {
          slug: slug,
        },
      },
      select: {
        id: true,       // Internal Mongo ID
        roomKey: true,  // The string ID used for the Room Name
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

    // 2. Validate Env Vars (Using your LIVEKIT_VIDEO prefix)
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

    // 3. Create Access Token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      metadata: JSON.stringify({
        isAgent: false,
        clientName: roomData.clientName,
        type: roomData.sessionType,
        dbId: roomData.id 
      }),
    });

    at.addGrant({
      roomJoin: true,
      room: roomData.roomKey, // Use the roomKey as the LiveKit Room Name
      canPublish: true,
      canSubscribe: true,
    });

    // 🤖 DISPATCH AGENT TO ROOM
    try {
      const agentDispatchClient = new AgentDispatchClient(
        wsUrl,
        apiKey,
        apiSecret
      );

      await agentDispatchClient.createDispatch(
        roomData.roomKey,
        "agent", // Your agent_name from LiveKit Cloud
        {
          metadata: JSON.stringify({
            clientName: roomData.clientName,
            sessionType: roomData.sessionType,
            dbId: roomData.id
          })
        }
      );
      
      console.log(`✅ Agent dispatched to room: ${roomData.roomKey}`);
    } catch (dispatchError) {
      console.error("❌ Agent dispatch failed:", dispatchError);
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