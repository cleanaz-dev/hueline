
//api/admin/check-subdomain
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RESERVED_SUBDOMAINS } from "@/lib/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  if (RESERVED_SUBDOMAINS.includes(slug.toLowerCase())) {
    return NextResponse.json({ available: false, reason: "reserved" });
  }

  try {
    const existing = await prisma.subdomain.findUnique({ where: { slug } });
    return NextResponse.json({ available: !existing });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Error checking subdomain:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}