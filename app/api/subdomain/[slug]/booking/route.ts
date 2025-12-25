import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;

  if (!slug)
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });

  try {
    const bookings = await prisma.subBookingData.findMany({
      where: {
        subdomain: { slug },
      },
      select: {
        huelineId: true,
        id: true,
        rooms: true,
        name: true,
        phone: true,
        projectScope: true,
        projectType: true,
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error(error)
    return NextResponse.json({message: "Error Retrieving Booking Data"}, {status: 500})
  }
}
