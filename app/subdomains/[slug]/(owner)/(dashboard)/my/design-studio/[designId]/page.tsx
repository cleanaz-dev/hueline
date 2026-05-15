import SingleDesignStudio from "@/components/owner/design-studio/single-design-studio";

interface Params {
  params: Promise<{
    designId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { designId } = await params;
  return <SingleDesignStudio designId={designId} />;
}
