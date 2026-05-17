import SingleDesignStudio from "@/components/owner/design-studio/single-design-studio-page";
import { getPresignedUrl } from "@/lib/aws/s3";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    designId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { designId } = await params;

  const designProject = await prisma.designProject.findUnique({
    where: { id: designId },
  });

  if (!designProject) {
    return null;
  }

  // Safely get the presigned URL only if the key exists
  const imageUrl = designProject.originalImageS3Key
    ? await getPresignedUrl(designProject.originalImageS3Key)
    : null;

  return (
    <SingleDesignStudio 
      designId={designId} 
      initialDesignProject={designProject} 
      initialImageUrl={imageUrl} 
    />
  );
}