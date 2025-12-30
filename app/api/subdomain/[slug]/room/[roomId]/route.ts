import { prisma } from "@/lib/prisma";
import { setRoomKey } from "@/lib/redis/services/room";
import { RoomData } from "@/types/room-types";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    // 1. AUTHENTICATION (Strict: Must be a logged-in User)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.subdomainUser.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 403 });
    }

    // 2. GET SUBDOMAIN
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

    // 3. REDIS (Hot Storage - Saves everything passed from frontend)
    await setRoomKey(roomId, body);

    // 4. DATABASE (Cold Storage)
    const room = await prisma.room.create({
      data: {
        roomKey: roomId, // The Identifier
        domain: { connect: { id: subdomain.id } },
        creator: { connect: { id: user.id } }, // STRICT: User is required

        // 👇 OPTIONAL: Only add Client Name if provided (Quick Session might not have it)
        ...(body.clientName && { clientName: body.clientName }),

        // 👇 OPTIONAL: Only add Client Phone if provided
        ...(body.clientPhone && { clientPhone: body.clientPhone }),

        // 👇 OPTIONAL: Only connect Booking if it exists (Linked Project)
        ...(body.bookingId && {
          booking: { connect: { id: body.bookingId } },
        }),
      },
    });

    // 5. ✅ CREATE LOG
    await createRoomLog({
      subdomainId: subdomain.id,
      roomKey: roomId,
      dbRoomId: room.id,
      actorEmail: session.user.email,
      clientName: body.clientName,
      bookingDataId: body.bookingId, // Pass the ID if it exists in the body
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
