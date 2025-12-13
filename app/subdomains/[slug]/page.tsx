import SubdomainDashboardPage from "@/components/subdomains/dashboard/client-dashboard-page";
import { verifySubdomainOwner } from "@/lib/auth";
import { checkSubdomainExists } from "@/lib/auth/guard/check-if-subdomain-exists";
import { getSubDomainData } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  // 🚫 Subdomain does not exist → login
  const exists = await checkSubdomainExists(slug);
  if (!exists) {
    redirect(`${process.env.NEXTAUTH_URL}/login`);

  }

  // 🔐 Ownership check
  await verifySubdomainOwner(slug);

  const subDomainData = await getSubDomainData(slug);
  if (!subDomainData) notFound();

  return (
    <SubdomainDashboardPage
      bookingData={subDomainData.bookings}
      accountData={subDomainData}
    />
  );
}
