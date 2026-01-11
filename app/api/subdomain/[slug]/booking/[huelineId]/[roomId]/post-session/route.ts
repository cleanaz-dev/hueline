import { getClientPostSession } from "@/lib/prisma/queries/post-session/get-client-post-session";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    huelineId: string;
    roomId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { huelineId, roomId, slug } = await params;

    if (!huelineId || !roomId || !slug) {
      return NextResponse.json(
        { message: "Invalid Request" }, 
        { status: 400 }
      );
    }

    const data = await getClientPostSession(huelineId, roomId);

    if (!data) {
      return NextResponse.json(
        { message: "Post session not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching post session:", error);
    return NextResponse.json(
      { message: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}