import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PinEntryForm from "./pin-entry-form";
import { getSubdomainLogo } from "@/lib/prisma/queries/get-subdomain-logo";

interface PageProps {
  params: Promise<{
    slug: string
  }>;
  searchParams: Promise<{ 
    huelineId?: string 
  }>;
}

export default async function SubdomainLoginPage({ 
  params,
  searchParams
}: PageProps) {

  const { slug } = await params;
  const { huelineId } = await searchParams;

  const logo = await getSubdomainLogo(slug);

  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
      </div>
    }>
      <PinEntryForm 
        logo={logo} 
        slug={slug}
        huelineId={huelineId}
      />
    </Suspense>
  );
}