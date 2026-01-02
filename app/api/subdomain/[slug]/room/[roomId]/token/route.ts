// app/api/token/[slug]/[roomId]/route.ts
import { AccessToken } from "livekit-server-sdk";
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
    // 1. Await params (Next.js 15+)
    const { slug, roomId } = await params;
    
    // 2. Get username from Query String
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // 3. Database Query
    // We search for the Room directly, but ensure it belongs to the Subdomain via 'slug'
    const roomData = await prisma.room.findFirst({
      where: {
        id: roomId,
        domain: {
          slug: slug, // This ensures the room belongs to the correct subdomain
        },
      },
      select: {
        id: true,
        clientName: true,
        sessionType: true,
        status: true,
      },
    });

    if (!roomData) {
      return NextResponse.json(
        { error: "Room not found or access denied" },
        { status: 404 }
      );
    }

    // 4. Validate Env Vars
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    // 5. Create Access Token
    // NOTE: This token is for the USER joining the room. 
    // The metadata here allows the AI Agent (listening in the room) to know who this is.
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      // Metadata visible to other participants (including the Agent)
      metadata: JSON.stringify({
        isAgent: false, // This user is NOT the agent
        clientName: roomData.clientName,
        type: roomData.sessionType,
        roomId: roomData.id
      }),
    });

    // 6. Set Permissions
    at.addGrant({
      roomJoin: true,
      room: roomId, // Must match the Room ID exactly
      canPublish: true,
      canSubscribe: true,
    });

    // 7. Return Token
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