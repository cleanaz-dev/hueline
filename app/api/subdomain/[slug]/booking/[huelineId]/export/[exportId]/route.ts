
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma"

interface Params {
  params: Promise<{
    huelineId: string;
    slug: string;
  }>;
}

export async function PATCH(
  req: Request,
  { params }: Params & { params: Promise<{ exportId: string }> }
) {
  const { exportId } = await params;

  try {
    const body = await req.json();
    const { status, downloadUrl, completedAt } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    const updatedExport = await prisma.export.update({
      where: { id: exportId },
      data: {
        status,
        ...(downloadUrl && { downloadUrl }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      export: updatedExport,
    });
  } catch (error) {
    console.error("Export update error:", error);
    return NextResponse.json(
      { error: "Failed to update export" },
      { status: 500 },
    );
  }
}
