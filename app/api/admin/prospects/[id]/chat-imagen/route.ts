import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    // 1. Destructure for clean visuals and type safety
    const { mediaUrl, brand, color, deliveryMethod } = await req.json();

    // 2. Basic Validation (Don't waste Lambda compute if data is missing)
    if (!mediaUrl || !brand || !color || !deliveryMethod) {
      return NextResponse.json(
        { message: "Missing required fields (mediaUrl, brand, color, deliveryMethod)" },
        { status: 400 }
      );
    }

    // 3. Verify Prospect
    const demoClient = await prisma.demoClient.findUnique({
      where: { id: id },
      select: { id: true },
    });

    if (!demoClient) {
      console.warn(`No Demo Client Found for ID: ${id}`);
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    // 4. Construct a clean, flat payload for Lambda
    const lambdaPayload = {
      prospectId: demoClient.id,
      mediaUrl,
      brand,
      color,
      deliveryMethod,
    };

    // 5. Fire to Lambda
    await axios.post(process.env.CHAT_IMAGEN_LAMBDA_URL!, lambdaPayload);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error: any) {
    // Cleaner error logging for Axios
    console.error(
      "Chat Imagen Lambda Error:",
      error.response?.data || error.message || error
    );

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}