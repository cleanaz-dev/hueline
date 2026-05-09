import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import axios from "axios";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const operator = await prisma.subdomainUser.findFirst({
    where: { email: session.user.email! },
    select: { id: true },
  });

  if (!operator) {
    return NextResponse.json(
      { message: "Operator not found" },
      { status: 400 },
    );
  }

  try {
    const { mediaUrl, brand, color, deliveryMethod, huelineId } =
      await req.json();

    if (!mediaUrl || !brand || !color || !deliveryMethod || !huelineId) {
      return NextResponse.json(
        {
          message:
            "Missing required fields (mediaUrl, brand, color, deliveryMethod, huelineId)",
        },
        { status: 400 },
      );
    }

    const demoClient = await prisma.demoClient.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!demoClient) {
      console.warn(`No Demo Client Found for ID: ${id}`);
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        jobType: "IMAGEN",
        brand: brand,
        hex: color.hex,
        code: color.code,
        name: color.name,
        model: "openai/gpt-image-2",
        cost: 0.13,
        deliveryMethod,
        initiator: "OPERATOR",
        operator: { connect: { id: operator.id } },
      },
    });

    const lambdaPayload = {
      action: "imagenOperator",
      prospectId: demoClient.id,
      mediaUrl,
      brand,
      color,
      deliveryMethod,
      jobId: job.id,
    };

    await axios.post(process.env.CHAT_IMAGEN_LAMBDA_URL!, lambdaPayload);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    console.error(
      "Chat Imagen Lambda Error:",
      error.response?.data || error.message || error,
    );

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
