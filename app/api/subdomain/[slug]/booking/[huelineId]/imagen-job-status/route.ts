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
    const subdomain = await prisma.subdomain.findUnique({
      where: {
        slug,
        bookings: {
          some: {
            huelineId,
          },
        },
      },
      select: { id: true },
    });

    if (!subdomain) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const systemTask = await prisma.systemTask.findFirst({
      where: {
        huelineId,
        type: "IMAGEN",
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

    return NextResponse.json({ systemTask: systemTask ?? null });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error Fetching systemTask Data" },
      { status: 500 },
    );
  }
}