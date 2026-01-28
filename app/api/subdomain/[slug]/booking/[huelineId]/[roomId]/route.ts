import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        slug: string;
        huelineId: string;
        roomId: string;
    }>
}

export async function DELETE(req: Request, { params }: Params) {
    try {
        const { huelineId, roomId, slug } = await params;

        // Validate required parameters
        if (!huelineId || !roomId || !slug) {
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // Check if room exists
        const existingRoom = await prisma.room.findFirst({
            where: { id: roomId }
        });

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Delete the room
        await prisma.room.delete({
            where: { id: existingRoom.id }
        });

        // Return success response
        return NextResponse.json(
            { success: true, message: "Room deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting room:", error);
        return NextResponse.json(
            { error: "Failed to delete room" },
            { status: 500 }
        );
    }
}