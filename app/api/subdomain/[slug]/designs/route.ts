import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getPresignedUrls } from "@/lib/aws/s3/services/get-presigned-url";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const designs = await prisma.designProject.findMany({
      where: { subdomain: { slug } },
    });

    const keys = designs
      .map((design) => design.originalImageS3Key)
      .filter((key): key is string => key !== null);

    const presignedUrls = keys.length > 0
      ? await getPresignedUrls(keys)
      : [];

    const urlMap = new Map<string, string>();
    keys.forEach((key, index) => {
      urlMap.set(key, presignedUrls[index]);
    });

    const results = designs.map((design) => ({
      ...design,
      originalImageUrl: design.originalImageS3Key
        ? urlMap.get(design.originalImageS3Key) ?? null
        : null,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to fetch designs:", error);
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}
