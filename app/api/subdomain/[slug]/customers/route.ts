import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const customers = await prisma.customer.findMany({
    where: { subdomain: { slug } },
  });
  return NextResponse.json({ customers });
}
