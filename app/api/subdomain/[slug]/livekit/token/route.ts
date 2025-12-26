import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: Promise<{
    slug: string
  }>
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const roomName = req.nextUrl.searchParams.get('room');
    const username = req.nextUrl.searchParams.get('username');

    // 1. Validation: If these are missing, the token is useless
    if (!roomName || !username) {
      return NextResponse.json(
        { error: 'Missing room or username parameters' }, 
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 2. Scoped Room Name to prevent cross-tenant collisions
    const scopedRoomName = `${slug}_${roomName}`;

    // 3. Fix the Type Error: 
    // Since we validated username exists above, TypeScript knows it's a string.
    // We pass it in the options object.
    const at = new AccessToken(apiKey, apiSecret, { 
      identity: username // Now guaranteed to be a string
    });

    at.addGrant({ 
      roomJoin: true, 
      room: scopedRoomName, 
      canPublish: true, 
      canSubscribe: true, 
      canPublishData: true,
    });

    return NextResponse.json({ token: await at.toJwt() });
    
  } catch (error) {
    console.error("Token Generation Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}