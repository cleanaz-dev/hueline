import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
    huelineId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { huelineId, slug } = await params;

  if (!huelineId || !slug) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  try {
    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: {
        subdomain: {
          select: { id: true, slug: true },
        },
      },
    });

    if (!booking || slug !== booking.subdomain.slug) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findFirst({
      where: {
        huelineId,
        jobType: "UPSCALE",
        status: { in: ["PENDING", "PROCESSING"] },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        status: true,
        id: true,
      },
    });

    return NextResponse.json({ job: job ?? null });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Fetching Job Data" },
      { status: 500 },
    );
  }
}
