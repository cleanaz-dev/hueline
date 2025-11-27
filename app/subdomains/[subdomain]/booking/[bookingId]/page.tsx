// app/subdomains/[subdomain]/booking/[bookingId]/page.tsx

import { SubDomainWrapper } from "@/components/subdomains/subdomain-wrapper";
import { getSubdomainData } from "@/lib/query";
import { getSubBooking } from "@/lib/redis";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    subdomain: string;
    bookingId: string;
  }>;
}

export default async function BookingPage({ params }: Props) {
  const { subdomain, bookingId } = await params;
  console.log("subdomain:", subdomain, "bookingId:", bookingId);
  const subDomainData = await getSubdomainData(subdomain);
  if (!subDomainData) notFound();
  console.log("👀 Subdomain Data:", subDomainData);
  const subBookingData = await getSubBooking(subdomain, bookingId);
  if (!subBookingData) notFound();
  console.log("🎯 Subdomain Booking Data:", subDomainData);
  return (
    <div>
      <SubDomainWrapper booking={subBookingData} subdomain={subDomainData} />
    </div>
  );
}
