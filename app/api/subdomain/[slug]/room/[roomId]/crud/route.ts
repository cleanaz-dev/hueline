import { NextResponse } from "next/server";

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

      case "delete":
        // TODO: Prisma code to delete the room
        return NextResponse.json({ message: "Room deleted successfully" });

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