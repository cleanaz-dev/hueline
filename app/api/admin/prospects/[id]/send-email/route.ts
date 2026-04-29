import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;

  try {
    
    const demoClient = await prisma.demoClient.findUnique({
      where: { id },
    });

    if (!demoClient) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const body = await req.json();

    console.log("Body:", body);

  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error:", error },
      { status: 500 },
    );
  }
}
