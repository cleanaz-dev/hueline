// app/api/subdomain/[slug]/room/[roomId]/scope/route.ts
import { createClient } from 'redis';
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

   const data = ""
    
   return NextResponse.json(data)

  } catch (error) {
    console.error(error);
    return NextResponse.json({message: "Internal Server Error"}, {status: 500});
  }
}

