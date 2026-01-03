import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

interface Params {
  params: Promise<{
    slug: string
  }>
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { message: "Slug parameter required" },
        { status: 400 }
      );
    }

    const rooms = await prisma.room.findMany({
      where: {
        domain: { slug }
      },
      include: {
        booking: true,
        creator: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { message: "Error fetching rooms", error: (error as Error).message },
      { status: 500 }
    );
  }
}