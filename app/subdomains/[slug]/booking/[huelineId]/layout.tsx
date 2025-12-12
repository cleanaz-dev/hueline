import { ReactNode } from 'react';
import { getBookingForPage } from "@/lib/prisma/queries/get-booking-for-page";
import { BookingProvider } from '@/context/booking-context';
import { BookingData, SubdomainAccountData } from '@/types/subdomain-type';

interface LayoutProps {
  params: Promise<{
    slug: string;
    huelineId: string; 
  }>;
  children: ReactNode;
}

export default async function BookingLayout({ params, children }: LayoutProps) {

  const { slug, huelineId } = await params;

  const booking = await getBookingForPage(huelineId, slug);

  if (!booking) {
  throw new Error("Booking not found");
}

  const subdomain = booking?.subdomain;

  return (
    <BookingProvider initialBooking={booking} subdomain={subdomain}>
      {children}
    </BookingProvider>
  );
}
