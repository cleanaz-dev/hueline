import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import axios from "axios";
import { LambdaImagenPayload } from "@/lib/zod";
import { getPresignedUrl } from "@/lib/aws/s3";
import { getColorSwatchUrl } from "@/lib/lambda-utils/color-swatch-url";
import { S3_BUCKET_NAME } from "@/lib/aws/s3";
import { BrandId } from "@/lib/desing-studio-config";

interface Params {
  params: Promise<{
    slug: string;
    designId: string;
  }>;
}

interface PayloadProps {
  brand: BrandId;
  code: string;
  hex: string;
  name: string;
  removeFurniture: boolean;
  huelineId?: string;
  customerId?: string;
  deliveryMethod: "SMS" | "EMAIL" | null;
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

  const [subdomain, designProject] = await Promise.all([
    prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true },
    }),
    prisma.designProject.findUnique({
      where: { id: designId },
      select: { originalImageS3Key: true },
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
  const {
    brand,
    code,
    name,
    hex,
    removeFurniture,
    huelineId,
    customerId,
    deliveryMethod,
  }: PayloadProps = body;

  const imageUrl = await getPresignedUrl(designProject.originalImageS3Key);
  const colorSwatchUrl = getColorSwatchUrl(brand, name, code, BUCKET_NAME);

  const systemTask = await prisma.systemTask.create({
    data: {
      subdomain: { connect: { id: subdomain.id } },
      initiator: "OPERATOR",
      status: "PENDING",
      type: "IMAGEN",
      metadataSource: "IMAGEN",
      operator: { connect: { id: subUser.id } },
      deliveryMethod,
      metadata: {
        brand,
        code,
        name,
        hex,
        removeFurniture,
        imageS3Key: designProject.originalImageS3Key,
      },
    },
  });

  const lambdaImagePayload: LambdaImagenPayload = {
    action: "",
    customerId: customerId ?? "",
    huelineId: huelineId ?? "",
    imageUrl,
    subdomainId: subdomain.id,
    systemTaskId: systemTask.id,
    colorSwatchUrl,
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

  return NextResponse.json({ message: "ok" }, { status: 200 });
}
