import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/aws/s3";

interface Params {
  params: Promise<{
    slug: string;
    designId: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug, designId } = await params;

    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!subdomain || !slug || !designId) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    // Changed to 'include' so you don't lose the base DesignProject fields
    const designProject = await prisma.designProject.findUnique({
      where: { id: designId },
      include: { 
        customer: true,
        booking: true,
        mockups: true,
      }
    });

    if (!designProject) {
      return NextResponse.json({ message: "Design Project not found" }, { status: 404 });
    }

    // Resolve Presigned URLs for all mockups concurrently
    if (designProject.mockups && designProject.mockups.length > 0) {
      designProject.mockups = await Promise.all(
        designProject.mockups.map(async (mockup) => ({
          ...mockup,
          presignedUrl: await getPresignedUrl(mockup.s3Key)
        }))
      );
    }

   

    return NextResponse.json(designProject);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching design project" },
      { status: 500 },
    );
  }
}
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { slug, designId } = await params;

    const subdomain = await prisma.subdomain.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!subdomain || !slug || !designId) {
      return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    }

    const body = await req.json();

    const { originalImageS3Key } = body;

    const updatedDesignProject = await prisma.designProject.update({
      where: { id: designId },
      data: {
        originalImageS3Key: originalImageS3Key,
      },
    });
    return NextResponse.json(updatedDesignProject.originalImageS3Key);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching design project" },
      { status: 500 },
    );
  }
}
