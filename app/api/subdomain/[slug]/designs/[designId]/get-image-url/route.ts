import { authOptions } from "@/lib/auth";
import { getPresignedUrl } from "@/lib/aws/s3";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; designId: string }> },
) {
  const { designId, slug } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Not Authorized" }, { status: 401 });
  }

  const subUser = await prisma.subdomainUser.findFirst({
    where: {
      email: session?.user.email,
      subdomain: { slug },
    },
  });

  if (!subUser) {
    return NextResponse.json({ message: "Access Denied" }, { status: 401 });
  }
  const design = await prisma.designProject.findUnique({
    where: { id: designId, subdomain: { slug } },
    select: { originalImageS3Key: true },
  });

  if (!design || !design.originalImageS3Key) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const url = await getPresignedUrl(design.originalImageS3Key);
  
  return NextResponse.json({ url });
}
