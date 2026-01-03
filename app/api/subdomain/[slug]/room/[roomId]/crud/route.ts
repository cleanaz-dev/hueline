//api/subdomain/[slug]/room/[roomId]/crud/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { slug, roomId } = await params;

    if (!slug || !roomId)
      return NextResponse.json(
        { message: "Invalid Parameters" },
        { status: 400 }
      );

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (!action)
      return NextResponse.json(
        { message: "Action parameter required" },
        { status: 400 }
      );

    switch (action) {
      case "end":
        // TODO: Prisma code to end the room
        return NextResponse.json({ message: "Room ended successfully" });

      case "archive":
        // TODO: Prisma code to archive the room
        return NextResponse.json({ message: "Room archived successfully" });

      default:
        return NextResponse.json(
          { message: "Invalid action. Use: end, archive, or delete" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error updating room" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { slug, roomId } = await params;
    if (!slug || !roomId)
      return NextResponse.json(
        { message: "Invalid Parameters" },
        { status: 400 }
      );
    
    // First, verify the room exists and belongs to the correct domain
    const room = await prisma.room.findUnique({
      where: {
        roomKey: roomId
      },
      include: {
        domain: true
      }
    });

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      );
    }

    if (room.domain.slug !== slug) {
      return NextResponse.json(
        { message: "Room does not belong to this domain" },
        { status: 403 }
      );
    }

    // Now delete the room
    await prisma.room.delete({
      where: {
        roomKey: roomId
      }
    });
    
    return NextResponse.json(
      { message: `Room ${roomId} has been deleted` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting room:", error);
    
    // Handle case where room doesn't exist
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Error deleting room" },
      { status: 500 }
    );
  }
}