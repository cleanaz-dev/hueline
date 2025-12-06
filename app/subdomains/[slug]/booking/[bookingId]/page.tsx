// app/subdomains/[subdomain]/booking/[bookingId]/page.tsx

import { SubDomainWrapper } from "@/components/subdomains/subdomain-wrapper";
import { getBookingByIdSlug } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
    bookingId: string;
  }>;
}

export default async function BookingPage({ params }: Props) {
  const { slug, bookingId } = await params;
  console.log("slug:", slug, "bookingId:", bookingId);
  
  const data = await getBookingByIdSlug(bookingId, slug);
  if (!data || data.bookings.length === 0) notFound();
  
  console.log("👀 Subdomain Data:", data);
  
  return (
    <div>
      <SubDomainWrapper booking={data.bookings[0]} subdomain={data} />
    </div>
  );
}