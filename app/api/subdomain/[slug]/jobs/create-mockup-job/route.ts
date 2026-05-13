import { CustomerType } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { connect } from "http2";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}
export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;

  const subdomain = await prisma.subdomain.findUnique({
    where: { slug },
    select: { id: true },
  });

  const body = await req.json();

  const isDemo = slug === "demo";

  const customerType = isDemo
    ? ("DEMO" as CustomerType)
    : ("HOMEOWNER" as CustomerType);

  const { name, phone, huelineId } = body;

  if (!slug || !subdomain || !name || !phone || !huelineId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  try {
    const newCusomter = await prisma.customer.create({
      data: {
        name,
        phone,
        customerType,
        status: "PENDING",
      },
    });
    const newSystemTask = await prisma.systemTask.create({
      data: {
        initiator: "CLIENT",
        type: "VOICE_MOCKUP",
        status: "PROCESSING",
        model: "google/nano-banana",
        cost: 0.04,
        customer: { connect: { id: newCusomter.id } },
        huelineId
      },
    });

    return NextResponse.json(
      { sytemTaskId: newSystemTask.id, customerId: newCusomter.id },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Errror" },
      { status: 500 },
    );
  }
}
