import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    huelineId: string;
    roomId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { huelineId, roomId, slug } = await params;

  if ((!huelineId || !roomId || !slug))
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });

  const bookingData = await prisma.subBookingData.findFirst({
    where: {
      subdomain: {
        slug: slug,
      },
      huelineId,
    },
    include: {
      paintColors: true,
      calls: {
        select: {
          intelligence: true,
        },
      },
    },
  });
}
