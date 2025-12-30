import SubdomainDashboardPage from "@/components/subdomains/dashboard/client-dashboard-page";
import { verifySubdomainOwner } from "@/lib/auth";
import { checkSubdomainExists } from "@/lib/auth/guard/check-if-subdomain-exists";
import { getSubDomainData } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import type { BookingData } from "@/types/subdomain-type";
import AdminDashboard from "@/components/admin/admin-dashboard";
import AdminWrapper from "@/components/admin/admin-wrapper";


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

  const session = await verifySubdomainOwner(slug);

  if(session?.role === "SUPER_ADMIN" && session.user.subdomainSlug === "admin") {
    return (
      <AdminWrapper />
    )
  }

  const subDomainData = await getSubDomainData(slug);
  if (!subDomainData) notFound();

  // console.log("Domain Data:", JSON.stringify(subDomainData, null, 2));

  return (
    <SubdomainDashboardPage
      bookingData={subDomainData.bookings as BookingData[]}
      accountData={subDomainData}
    />
  );
}