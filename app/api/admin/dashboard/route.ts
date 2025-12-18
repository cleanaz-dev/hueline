import { prisma } from "@/lib/prisma";
import { verifyApiSuperAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getSuperAdminDashboardStats } from "@/lib/prisma";

export async function GET() {
  try {
    const authCheck = await verifyApiSuperAdmin();
    
    // If it's not a session, it's an error response - return it
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    // authCheck is now the session
    const session = authCheck;

    const stats = await getSuperAdminDashboardStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}