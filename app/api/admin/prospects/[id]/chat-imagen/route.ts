import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import axios from "axios";
import { NextResponse } from "next/server";
import { lambdaPayloadSchema, type LambdaImagenPayload } from "@/lib/zod";
import { getPresignedUrl } from "@/lib/aws/s3";
import { getColorSwatchPresignedUrl } from "@/lib/lambda-utils/color-swatch-url";
import { acquireResourceLock, releaseResourceLock } from "@/lib/redis";
import { ChatImagenMetadata } from "@/lib/zod/chat-imagen-metadata-schema";

interface Params {
  params: Promise<{ id: string }>;
}

const lambdaUrl = process.env.LAMBDA_IMAGEN_URL!;

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  // ---- Auth ----
  const session = await getServerSession(authOptions);
  if (!session?.user || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ---- Operator ----
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

  // ---- Body ----
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

  // ---- Customer ----
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { id: true },
  });

  const booking = await prisma.subBookingData.findUnique({
    where: {
      huelineId,
    },
    select: {
      subdomainId: true,
    },
  });
  if (!customer || !booking?.subdomainId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  // ---- Pre-fetch assets (before lock, no point holding lock during these) ----
  const normalizedDelivery = deliveryMethod.toUpperCase() as "SMS" | "EMAIL";
  const imageUrl = await getPresignedUrl(mediaUrl, 3600);
  const { colorSwatchKey, colorSwatchUrl } = await getColorSwatchPresignedUrl(
    color.brand,
    color.name,
    color.code,
  );

  // ---- Lock ----
  let lockKey: string | null = null;

  try {
    lockKey = await acquireResourceLock(huelineId, "IMAGEN");
    if (!lockKey) {
      return NextResponse.json(
        { message: "Task already running for this project!" },
        { status: 429 },
      );
    }

    // ---- Create Task ----
    const systemTask = await prisma.systemTask.create({
      data: {
        type: "IMAGEN",
        lockKey,
        model: "google/nano-banana-pro",
        cost: 0.15,
        deliveryMethod,
        initiator: "OPERATOR",
        operator: { connect: { id: operator.id } },
        subdomain: { connect: { id: booking.subdomainId } },
        status: "PENDING",
        metadataSource: "IMAGEN",
        metadata: {
          brand: color.brand,
          hex: color.hex,
          code: color.code,
          name: color.name,
          imageS3Key: huelineId,
          colorSwatchKey,
        } satisfies ChatImagenMetadata,
      },
    });

    // ---- Build & Validate Payload ----
    const lambdaPayload: LambdaImagenPayload = {
      action: "OPERATOR_IMAGEN",
      customerId: customer.id,
      subdomainId: operator.subdomainId,
      imageUrl,
      colorSwatchUrl,
      systemTaskId: systemTask.id,
      huelineId,
      deliveryMethod: normalizedDelivery,
    };

    const parsed = lambdaPayloadSchema.safeParse(lambdaPayload);
    if (!parsed.success) {
      console.error("Invalid payload:", parsed.error.issues);
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    // ---- Fire Lambda (lock stays held until Lambda releases it) ----
    await axios.post(lambdaUrl, lambdaPayload);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    console.error(
      "Operator Imagen Error:",
      error.response?.data || error.message || error,
    );
    if (lockKey) await releaseResourceLock(lockKey); // only release on failure
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
