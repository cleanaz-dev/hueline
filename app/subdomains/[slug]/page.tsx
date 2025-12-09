import SubdomainDashboardPage from "@/components/subdomains/dashboard/client-dashboard-page";
import { verifySubdomainOwner } from "@/lib/auth";
import { getSubDomainData } from "@/lib/prisma";
import { notFound } from "next/navigation"; 

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SubdomainPage({ params }: Params) {
  const { slug } = await params;
  console.log("👀 Slug:", slug)


  await verifySubdomainOwner(slug);

  const subDomainData = await getSubDomainData(slug);
    console.log("📦 Domain Data:", subDomainData)

  // ✅ HANDLE NULL CASE
  if (!subDomainData) notFound()

  return (
    <div>
      <SubdomainDashboardPage
        bookingData={subDomainData.bookings}
        accountData={subDomainData}
      />
    </div>
  );
}