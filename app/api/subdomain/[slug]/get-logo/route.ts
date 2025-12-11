// app/api/subdomain/[slug]/get-logo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { logo: true },
    });

    if (!subdomain || !subdomain.logo) {
      return NextResponse.json({ logo: null });
    }

    return NextResponse.json({ logo: subdomain.logo });
  } catch (error) {
    console.error("Error fetching logo:", error);
    return NextResponse.json({ logo: null }, { status: 500 });
  }
}
