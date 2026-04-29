import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const messages = await prisma.clientCommunication.findMany({
      where: { 
        OR: [
          { demoClientId: params.id },
          { clientId: params.id }
        ]
      },
      orderBy: { createdAt: "asc" }, // Ascending for chat order
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}