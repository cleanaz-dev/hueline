import { verifyApiSuperAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const authCheck = await verifyApiSuperAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  return NextResponse.json({ success: true }, { status: 200 });
}