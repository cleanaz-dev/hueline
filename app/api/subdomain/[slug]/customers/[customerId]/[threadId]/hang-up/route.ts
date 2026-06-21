import { authOptions } from "@/lib/auth";
import { roomService } from "@/lib/livekit/config";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    customerId: string;
    threadId: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { customerId, slug, threadId } = await params;

  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!session || !user?.email)
    return NextResponse.json({ message: "Unathorized" }, { status: 401 });

  const isUserValid = await prisma.subdomainUser.findFirst({
    where: {
      email: user.email,
      subdomain: { slug }
    },
  });
  if (!isUserValid)
    return NextResponse.json({ message: "Invalid Request" }, { status: 401 });

  try {
    const outboundCall = await prisma.call.findFirst({
      where: {
        customerId,
        threadId,
        callDirection: "OUTBOUND",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        roomName: true,
      },
    });

    if (!outboundCall) {
      return NextResponse.json(
        { message: "No outbound call found" },
        { status: 404 },
      );
    }

    if (!outboundCall.roomName) {
      return NextResponse.json(
        { message: "Call has no associated room" },
        { status: 400 },
      );
    }
    // roomService to Delete the Room
    await roomService.deleteRoom(outboundCall.roomName);

    return NextResponse.json({ message: "Call Cancelled" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Cancelling Call" },
      { status: 500 },
    );
  }
}
