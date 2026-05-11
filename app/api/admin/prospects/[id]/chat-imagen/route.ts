import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import axios from "axios";
import { NextResponse } from "next/server";
import { lambdaPayloadSchema, type LambdaImagenPayload } from "@/lib/zod";
import { getPresignedUrl } from "@/lib/aws/s3";

interface Params {
  params: Promise<{ id: string }>;
}
const lambdaUrl = process.env.LAMBDA_IMAGEN_URL!;

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const operator = await prisma.subdomainUser.findFirst({
    where: { email: session.user.email! },
    select: { id: true, subdomainId: true },
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

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!customer) {
      console.warn(`No Customer Found for ID: ${id}`);
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
        status: "PENDING",
        huelineId: huelineId,
      },
    });

    const imageUrl = await getPresignedUrl(mediaUrl, 3600);

    const targetColor = {
      brand,
      hex: color.hex,
      code: color.code,
      name: color.name,
    };

    const lambdaPayload: LambdaImagenPayload = {
      action: "OPERATOR_IMAGEN",
      customerId: customer.id,
      subdomainId: operator.subdomainId,
      imageUrl,
      targetColor,
      jobId: job.id,
      huelineId,
    };

    const parsed = lambdaPayloadSchema.safeParse(lambdaPayload);
    if (!parsed.success) {
      console.error("Invalid payload:", parsed.error.issues);
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await axios.post(lambdaUrl, lambdaPayload);

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
