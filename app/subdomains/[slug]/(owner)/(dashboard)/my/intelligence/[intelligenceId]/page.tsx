import { Intelligence } from "@/app/generated/prisma";
import { SinglePageIntelligence } from "@/components/intelligence/single-page-intelligence";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Params {
  params: Promise<{
    intelligenceId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { intelligenceId } = await params;
  const intelligence = await prisma.intelligence.findUnique({
    where: {
      id: intelligenceId
    },
  });

  if(!intelligence) return notFound()

    return <SinglePageIntelligence intelligence={intelligence} />

}