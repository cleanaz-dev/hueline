// @/app/api/generate-mockup/route.ts
import { BrandId } from "@/lib/desing-studio-config";
import { getColorSwatchPresignedUrl } from "@/lib/lambda-utils/color-swatch-url";
import { resolveNewColor } from "@/lib/moonshot/services/resolve-color";
import { prisma } from "@/lib/prisma";
import { getOriginalImageUrl } from "@/lib/prisma/mutations/s3key";
import { lambdaPayloadSchema, type LambdaImagenPayload } from "@/lib/zod";
import { CurrentColor, TargetColor } from "@/types/paint-types";
import axios from "axios";
import { NextResponse } from "next/server";
import { ClientImagenMetadata } from "@/lib/zod/client-imagen-metadata";
import { acquireResourceLock, releaseResourceLock, updateLockWithTaskId } from "@/lib/redis"

interface Params {
  params: Promise<{
    huelineId: string;
    slug: string;
  }>;
}

const lambdaUrl = process.env.LAMBDA_IMAGEN_URL!;

export async function POST(req: Request, { params }: Params) {
  const { huelineId, slug } = await params;
  const resourceId = huelineId;

  if (!resourceId) {
    return NextResponse.json({ error: "No resource ID" }, { status: 400 });
  }

  // 1. Declare lockKey OUTSIDE the try/catch so the catch block can access it!
  let lockKey: string | null = null;

  try {
    const body = await req.json();
    const { option, currentColor, removeFurniture, targetColor } = body;
    const color = currentColor?.[0];

    // 2. CHEAP VALIDATION FIRST: Don't bother locking if the payload is garbage
    if (!option || !color) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 3. ACQUIRE LOCK: Now that we know the payload is decent, lock the resource
    lockKey = await acquireResourceLock(resourceId, "IMAGEN");

    if (!lockKey) {
      return NextResponse.json({ message: "Task already running for this project!" }, { status: 429 });
    }

    // 4. EXPENSIVE DB CHECKS
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug, bookings: { some: { huelineId } } },
      select: { id: true },
    });

    const booking = await prisma.subBookingData.findUnique({
      where: { huelineId },
      select: { id: true, originalImages: true, customer: true },
    });

    if (!subdomain || !booking || !booking.customer?.id) {
      await releaseResourceLock(lockKey); // <--- RELEASE BEFORE EARLY RETURN
      return NextResponse.json({ message: "Missing required data" }, { status: 400 });
    }

    const { originalImageUrl, roomType } = await getOriginalImageUrl(huelineId);
    if (!originalImageUrl && !roomType) {
      await releaseResourceLock(lockKey); // <--- RELEASE BEFORE EARLY RETURN
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    // 5. DO THE HEAVY LIFTING
    const newColor = await resolveNewColor(option, color, targetColor);
    const { colorSwatchKey, colorSwatchUrl } = await getColorSwatchPresignedUrl(
      newColor.brand as BrandId,
      newColor.name,
      newColor.code,
    );

    const systemTask = await prisma.systemTask.create({
      data: {
        initiator: "CLIENT",
        type: "IMAGEN",
        status: "PENDING",
        cost: 0.15,
        model: "google/nano-banana-pro",
        deliveryMethod: "SMS",
        lockKey,
        customer: { connect: { id: booking.customer?.id } },
        metadataSource: "IMAGEN",
        metadata: {
          huelineId: huelineId,
          brand: color.brand,
          code: color.code,
          name: color.name,
          hex: color.hex,
          removeFurniture,
          roomType,
          imageS3Key: booking.originalImages,
          colorSwatchKey,
        } satisfies ClientImagenMetadata,
      },
    });

    const generatePayload: LambdaImagenPayload = {
      customerId: booking.customer?.id,
      imageUrl: originalImageUrl,
      huelineId: huelineId,
      subdomainId: subdomain.id,
      action: "CLIENT_IMAGEN",
      systemTaskId: systemTask.id,
      deliveryMethod: "SMS",
      colorSwatchUrl,
    };

    const parsed = lambdaPayloadSchema.safeParse(generatePayload);
    if (!parsed.success) {
      console.error("Invalid payload:", parsed.error.issues);
      await releaseResourceLock(lockKey); // <--- RELEASE BEFORE EARLY RETURN
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    // 6. FIRE LAMBDA
    await axios.post(lambdaUrl, generatePayload);

    await updateLockWithTaskId(lockKey, systemTask.id)

    // CRITICAL: DO NOT release the lock here! We want it to stay locked until the webhook finishes.
    return NextResponse.json(
      { message: "success", systemTaskId: systemTask.id },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in color generation:", error);
    
    // 7. SAFE CATCH: Because lockKey is outside the try block, this works perfectly.
    if (lockKey) {
      await releaseResourceLock(lockKey);
    }
    
    return NextResponse.json(
      { message: "Error Generating New Mockup", error: String(error) },
      { status: 500 }
    );
  }
}