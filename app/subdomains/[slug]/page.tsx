import SubdomainDashboardPage from "@/components/subdomains/dashboard/client-dashboard-page";
import { getSubDomainData } from "@/lib/prisma";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SubdomainPage({ params }: Params) {
  const { slug } = await params;
  const subDomainData = await getSubDomainData(slug);
  // console.log("Sub Domain Data:", subDomainData);
  return (
    <div>
      <SubdomainDashboardPage
        bookingData={subDomainData.bookings}
        accountData={subDomainData}
      />
    </div>
  );
}
