import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const demoClients = await prisma.demoClient.findMany({
      select: {
        subBookingData: {
          select: {
            huelineId: true
          }
        }
      }
    });
    return NextResponse.json(demoClients);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
