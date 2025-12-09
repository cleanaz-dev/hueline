//subdomains/[slug]/stats/route.ts

import { NextResponse } from "next/server";
import { mutateDashboardStats } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string
  }>
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    
    const stats = await mutateDashboardStats(slug);
    console.log("🔢 Stats:", stats)
    
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error Retrieving Stats" },
      { status: 500 }
    );
  }
}