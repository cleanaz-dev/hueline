import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POSTS(req: Request, { params }: Params) {
  const { slug } = await params;

  const subdomain = await prisma.subdomain.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!subdomain) {
    return NextResponse.json({ message: "Invalid Requests" }, { status: 400 });
  }

  const systemTask = await prisma.systemTask.create({
    data: {
      subdomain: {connect: {id: subdomain.id}},
      initiator:"OPERATOR",
      status: "PENDING",
      type: "IMAGEN",
      
    }
  })

  return NextResponse.json({ message: "ok" }, { status: 200 });
}
