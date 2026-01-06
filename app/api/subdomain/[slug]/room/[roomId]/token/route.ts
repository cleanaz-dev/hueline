// app/api/token/[slug]/room/[roomId]/route.ts
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
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
        domainId: true,
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

    // Update room metadata with domain ID
    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);
    await roomService.updateRoomMetadata(roomData.roomKey, JSON.stringify({
      domainId: roomData.domainId,
      clientName: roomData.clientName,
      sessionType: roomData.sessionType,
      dbId: roomData.id
    }));

    const at = new AccessToken(apiKey, apiSecret, {
      identity: identity,
      metadata: JSON.stringify({
        isAgent: false,
        clientName: roomData.clientName,
        type: roomData.sessionType,
        dbId: roomData.id,
        domainId: roomData.domainId
      }),
    });

    at.addGrant({
      roomJoin: true,
      room: roomData.roomKey,
      canPublish: true,
      canSubscribe: true,
    });

    console.log(`✅ Token generated for ${identity} in room ${roomData.roomKey}`);

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