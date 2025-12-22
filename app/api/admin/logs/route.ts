import { verifyApiSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  try {
    const authCheck = await verifyApiSuperAdmin();

    // If it's not a session, it's an error response - return it
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const logs = await prisma.logs.findMany({
      include: {
        subdomain: {
          select: {
            companyName: true
          }
        }
      }
    })

    return NextResponse.json({ logs });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
