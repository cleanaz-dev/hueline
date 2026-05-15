import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;

  const body = await req.json();
  const { customerName, customerPhone, customerEmail } = body;

  if (!slug || !customerEmail || !customerName || !customerPhone) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  const existingDomain = await prisma.subdomain.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!existingDomain) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  const newCustomer = await prisma.customer.create({
    data: {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      subdomain: { connect: { id: existingDomain.id } },
    },
  });

  return NextResponse.json(newCustomer);
}

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const customers = await prisma.customer.findMany({
    where: { subdomain: { slug } },
  });
  return NextResponse.json({ customers });
}
