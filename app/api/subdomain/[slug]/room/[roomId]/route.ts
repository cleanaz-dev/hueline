import { prisma } from "@/lib/prisma";
import { setRoomKey } from "@/lib/redis/services/room";
import { RoomData } from "@/types/room-types";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ensure this path is correct
import { createRoomLog } from "@/lib/prisma/mutations/logs/create-room-log";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug, roomId } = await params;
  const body: RoomData = await req.json();
  console.log("📦 Body:", body);
  
  if (!slug || !roomId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  
  try {
    // 1. AUTHENTICATION & SESSION CHECK
    const session = await getServerSession(authOptions);

    const userEmail = session?.user?.email;
    // Check if they are authenticated via PIN (Client)
    const isPinAuth = !!session?.user?.huelineId; 

    // If neither email auth nor PIN auth, reject
    if (!userEmail && !isPinAuth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    // 2. RESOLVE USER (Only if Email Auth)
    let userId: string | null = null;

    if (userEmail) {
      const user = await prisma.subdomainUser.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });
      
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 403 });
      }
      userId = user.id;
    }
    
    // 3. GET SUBDOMAIN
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true },
    });
    
    if (!subdomain) {
      return NextResponse.json(
        { message: "Subdomain not found" },
        { status: 404 }
      );
    }
    
    // 4. REDIS (Hot Storage)
    await setRoomKey(roomId, body);
    
    // 5. DATABASE (Cold Storage)
    // We strictly define the data object to handle conditional creator
    const roomCreateData: any = {
        roomKey: roomId,
        domain: { connect: { id: subdomain.id } },
        // Add sessionType
        ...(body.sessionType && { sessionType: body.sessionType }),
        // Client Info
        ...(body.clientName && { clientName: body.clientName }),
        ...(body.clientPhone && { clientPhone: body.clientPhone }),
        // Booking Connection
        ...(body.bookingId && {
          booking: { connect: { id: body.bookingId } },
        }),
    };

    // 🛑 CRITICAL CHANGE: Only connect 'creator' if we actually have a userId (Account Owner).
    // If it's a PIN Client, this field is skipped (assuming your Prisma schema allows creator to be optional or you rely on 'booking' relation).
    if (userId) {
        roomCreateData.creator = { connect: { id: userId } };
    }

    const room = await prisma.room.create({
      data: roomCreateData,
    });
    
    // 6. ✅ CREATE LOG
    await createRoomLog({
      subdomainId: subdomain.id,
      roomKey: roomId,
      dbRoomId: room.id,
      // Fallback for PIN users who don't have emails
      actorEmail: userEmail || `Client-PIN-${session?.user?.huelineId}`,
      clientName: body.clientName,
      bookingDataId: body.bookingId,
    });
    
    return NextResponse.json({ success: true, id: room.id }, { status: 200 });

  } catch (error) {
    console.error("Create Room Error:", error);
    return NextResponse.json(
      { message: "Error Creating Room" },
      { status: 500 }
    );
  }
}