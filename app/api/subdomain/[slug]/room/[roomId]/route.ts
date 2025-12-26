import { setRoomKey } from "@/lib/redis/services/room";
import { RoomData } from "@/types/room-types";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}


export async function POST(req: Request, { params }: Params) {
  const { slug, roomId } = await params;
  const body: RoomData = await req.json();

  if (!slug || !roomId)
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });

  try {
    // Store room data with all the info from frontend
    await setRoomKey(roomId, body);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Saving Room Key" },
      { status: 500 }
    );
  }
}