import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!subdomain) {
      return NextResponse.json(
        { message: "Subdomain Does Not Exist" },
        { status: 400 },
      );
    }

    const newDesignProject = await prisma.designProject.create({
      data: {
        subdomain: { connect: { id: subdomain.id } },
      },
    });

    return NextResponse.json(
      { designId: newDesignProject.id },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error creating new project!" },
      { status: 500 },
    );
  }
}
