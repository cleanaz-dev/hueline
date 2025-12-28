//api/subdomain/[slug]/room/[roomId]/scope/route.ts
import { getRoomScope } from "@/lib/redis";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    roomId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug, roomId } = await params;

    if (!slug || !roomId)
      return NextResponse.json(
        { message: "Invalid Parameters" },
        { status: 400 }
      );

    const items = await getRoomScope(roomId); 

    return NextResponse.json({ items: items || [] }); 
  } catch (error) {
    console.error(error);
   return NextResponse.json({ items: [] }, { status: 500 });
  }
}