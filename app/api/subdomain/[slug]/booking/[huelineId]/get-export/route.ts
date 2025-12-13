// app/api/subdomain/[slug]/booking/[huelineId]/get-export/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; huelineId: string }> }
) {
  try {
    const { slug, huelineId } = await params;

    // Get booking ID from huelineId
    const booking = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Fetch all exports for this booking
    const exportData = await prisma.subBookingData.findMany({
      where: { huelineId },
      select:{
        exports: true
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("Export data;", exportData)

    return NextResponse.json({ exports: exportData });
  } catch (error) {
    console.error("Error fetching exports:", error);
    return NextResponse.json(
      { error: "Failed to fetch exports" },
      { status: 500 }
    );
  }
}