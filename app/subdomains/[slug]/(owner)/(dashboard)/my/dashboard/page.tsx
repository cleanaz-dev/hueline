import SubdomainDashboardPage from "@/components/subdomains/dashboard/client-dashboard-page";
import { checkSubdomainExists } from "@/lib/auth/guard/check-if-subdomain-exists";
import { getSubDomainData } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ExtendedBookingData } from "@/context/dashboard-context"; // 👈 import this

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  const exists = await checkSubdomainExists(slug);
  if (!exists) {
    redirect(`${process.env.NEXTAUTH_URL}/login`);
  }

  const subDomainData = await getSubDomainData(slug);
  if (!subDomainData) notFound();

  return (
    <SubdomainDashboardPage
      bookingData={subDomainData.bookings as unknown as ExtendedBookingData[]} // 👈 cast to the right type
      accountData={subDomainData}
    />
  );
}