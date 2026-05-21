import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import axios from "axios";
import { LambdaImagenPayload } from "@/lib/zod";
import { getPresignedUrl } from "@/lib/aws/s3";
import { getColorSwatchPresignedUrl } from "@/lib/lambda-utils/color-swatch-url";
import { S3_BUCKET_NAME } from "@/lib/aws/s3";
import { BrandId } from "@/lib/desing-studio-config";
import { DesignStudioMetadata } from "@/lib/zod/design-studio-metadata";
import { DesignStudioGenerateSchema } from "@/lib/zod/design-studio-endpoint-schema";
import z from "zod";
import { acquireResourceLock } from "@/lib/redis";

interface Params {
  params: Promise<{
    slug: string;
    designId: string;
  }>;
}

const LAMBDA_IMAGEN_URL = process.env.LAMBDA_IMAGEN_URL;
const BUCKET_NAME = S3_BUCKET_NAME;

export async function POST(req: Request, { params }: Params) {
  if (!LAMBDA_IMAGEN_URL || !BUCKET_NAME) {
    return NextResponse.json(
      { message: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user.email;
  const { slug, designId } = await params;

  const resourceId = designId;

  if (!resourceId) {
    return NextResponse.json({ error: "No resource ID" }, { status: 400 });
  }

  // 1. Declare lockKey OUTSIDE the try/catch so the catch block can access it!
  let lockKey: string | null = null;

  // --- Validate subdomain, user, and design project ---
  const [subdomain, designProject] = await Promise.all([
    prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true },
    }),
    prisma.designProject.findUnique({
      where: { id: designId },
      select: { 
        originalImageS3Key: true,
        booking: {
          select: {
            huelineId: true,
          }
        }
      },

    }),
  ]);

  if (!subdomain || !designProject || !designProject.originalImageS3Key) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  const subUser = await prisma.subdomainUser.findFirst({
    where: {
      email: userEmail,
      subdomainId: subdomain.id,
    },
  });

  if (!subUser) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log("DS body:", body);

  // 2. Parse the body
  const parsed = DesignStudioGenerateSchema.safeParse(body);

  if (!parsed.success) {
    // 3. Use Zod 4's top-level flattenError function
    const errorDetails = z.flattenError(parsed.error).fieldErrors;

    // 4. Log exactly what failed and what the frontend sent
    console.error("❌ Zod Validation Failed! Payload:", body);
    console.error("❌ Zod Errors:", errorDetails);

    return NextResponse.json(
      {
        message: "Invalid request",
        errors: errorDetails,
      },
      { status: 400 },
    );
  }
  // --- Parse & validate body ---

  const {
    color,
    removeFurniture,
    customerId,
    deliveryMethod,
    roomType,
    huelineId,
  } = parsed.data;

  // --- Get presigned URLs ---
  const imageUrl = await getPresignedUrl(designProject.originalImageS3Key);
  const { colorSwatchKey, colorSwatchUrl } = await getColorSwatchPresignedUrl(
    color.brand,
    color.name,
    color.code,
  );

  // --- Normalize delivery method to uppercase for DB/Lambda ---
  const normalizedDelivery = deliveryMethod.toUpperCase() as "SMS" | "EMAIL";

  const taskAction: LambdaImagenPayload["action"] = designProject.booking?.huelineId
    ? "EXISTING_DESIGN_STUDIO_IMAGEN"
    : "NEW_DESIGN_STUDIO_IMAGEN";

  // 3. ACQUIRE LOCK: Now that we know the payload is decent, lock the resource
  lockKey = await acquireResourceLock(resourceId, "IMAGEN");

  if (!lockKey) {
    return NextResponse.json(
      { message: "Task already running for this project!" },
      { status: 429 },
    );
  }

  // --- Create system task ---
  const systemTask = await prisma.systemTask.create({
    data: {
      lockKey,
      subdomain: { connect: { id: subdomain.id } },
      initiator: "OPERATOR",
      status: "PENDING",
      type: "IMAGEN",
      metadataSource: "IMAGEN",
      model: "google/nano-banana-pro",
      cost: 0.15,
      operator: { connect: { id: subUser.id } },
      deliveryMethod: normalizedDelivery,
      customer: { connect: { id: customerId } },
      metadata: {
        brand: color.brand,
        code: color.code,
        name: color.name,
        hex: color.hex,
        removeFurniture,
        roomType,
        imageS3Key: designProject.originalImageS3Key,
        designProjectId: designId,
        colorSwatchKey,
      } satisfies DesignStudioMetadata,
    },
  });

  // --- Fire Lambda ---
  const lambdaImagePayload: LambdaImagenPayload = {
    action: taskAction,
    customerId: customerId,
    huelineId: huelineId ?? "",
    imageUrl,
    colorSwatchUrl,
    subdomainId: subdomain.id,
    systemTaskId: systemTask.id,
    deliveryMethod: normalizedDelivery,
  };

  try {
    await axios.post(LAMBDA_IMAGEN_URL, lambdaImagePayload);
  } catch (error) {
    console.error("Lambda call failed:", error);
    return NextResponse.json(
      { message: "Failed to trigger image processing" },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      message: "Generation started",
      systemTaskId: systemTask.id,
      status: "PENDING",
    },
    { status: 200 },
  );
}
