import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        subdomain: {
          slug: "demo"
        }
      },
      select: {
        subBookingData: {
          select: {
            huelineId: true
          }
        }
      }
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
