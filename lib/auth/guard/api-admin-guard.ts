import { getServerSession } from "next-auth";
import { authOptions } from "../config";
import { NextResponse } from "next/server";

export async function verifyApiSuperAdmin() {
  const session = await getServerSession(authOptions);

  // Check if session exists
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized - No session found" },
      { status: 401 }
    );
  }

  // Check if user is SUPER_ADMIN
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden - Super Admin access required" },
      { status: 403 }
    );
  }

  // Return the session if authorized
  return session;
}