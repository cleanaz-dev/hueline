import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    const { s3Key } = await req.json();

    const communication = await prisma.clientCommunication.create({
      data: {
        body: "AI generated image",
        role: "AI",
        type: "IMAGEN",
        mediaUrl: s3Key,
        mediaSource: "S3",
        demoClientId: id,
      },
    });

    return NextResponse.json(communication);
  } catch (error) {
    return NextResponse.json(
      { message: "Server Error:", error },
      { status: 500 },
    );
  }
}