import { verifyApiSuperAdmin } from "@/lib/auth";
import { getAllClients } from "@/lib/prisma/queries/admin/get-all-clients";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  try {
    const authCheck = await verifyApiSuperAdmin();

    // If it's not a session, it's an error response - return it
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    const clients = await getAllClients();

    return NextResponse.json({ clients });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
