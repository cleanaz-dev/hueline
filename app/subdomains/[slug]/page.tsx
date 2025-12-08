import SubdomainDashboardPage from "@/components/subdomains/dashboard/client-dashboard-page";
import { getSubDomainData } from "@/lib/prisma";
import { notFound } from "next/navigation"; // ✅ ADD THIS

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SubdomainPage({ params }: Params) {
  const { slug } = await params;
  const subDomainData = await getSubDomainData(slug);

  // ✅ HANDLE NULL CASE
  if (!subDomainData) {
    console.warn(`Subdomain not found: ${slug}`);
    notFound(); // This will show your 404 page
  }

  return (
    <div>
      <SubdomainDashboardPage
        bookingData={subDomainData.bookings}
        accountData={subDomainData}
      />
    </div>
  );
}