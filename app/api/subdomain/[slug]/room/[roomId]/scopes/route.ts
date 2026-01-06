// app/api/subdomain/[slug]/room/[roomId]/scopes/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise <{
    slug: string;
    roomId: string; // This is the roomKey (e.g. "room_123")
  }>;
}

// 1. GET: Required for SWR to revalidate data
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug, roomId } = await params;

    const room = await prisma.room.findFirst({
      where: {
        roomKey: roomId, // Searching by the public key
        domain: {
          slug: slug,
        },
      },
      select: {
        id: true,
        scopeData: true, // Only fetching what we need
        status: true,
        clientName: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. PATCH: Your existing update logic (cleaned up)
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { slug, roomId } = await params;
    const body = await req.json();
    const { scopeData, status, name } = body;

    // Verify room exists
    const existingRoom = await prisma.room.findFirst({
      where: {
        roomKey: roomId,
        domain: { slug: slug },
      },
    });

    if (!existingRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Update using the internal _id found above
    const updatedRoom = await prisma.room.update({
      where: { id: existingRoom.id },
      data: {
        ...(scopeData !== undefined && { scopeData }),
        ...(status !== undefined && { status }),
        ...(name !== undefined && { clientName: name }),
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("[ROOM_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}