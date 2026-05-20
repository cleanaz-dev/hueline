import { CustomerType } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { acquireResourceLock } from "@/lib/redis";
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

  const resourceId = huelineId;

  if (!resourceId) {
    return NextResponse.json({ error: "No resource ID" }, { status: 400 });
  }

  // 1. Declare lockKey OUTSIDE the try/catch so the catch block can access it!
  let lockKey: string | null = null;

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

    // 3. ACQUIRE LOCK: Now that we know the payload is decent, lock the resource
    lockKey = await acquireResourceLock(resourceId, "IMAGEN");

    if (!lockKey) {
      return NextResponse.json(
        { message: "Task already running for this project!" },
        { status: 429 },
      );
    }
    const newSystemTask = await prisma.systemTask.create({
      data: {
        lockKey,
        initiator: "CLIENT",
        type: "VOICE_MOCKUP",
        status: "PROCESSING",
        model: "google/nano-banana",
        cost: 0.04,
        customer: { connect: { id: newCusomter.id } },
        subdomain: { connect: { id: subdomain.id } },
        deliveryMethod: "NONE"
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
