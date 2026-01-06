import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getBookingForPage } from "@/lib/prisma/queries/get-booking-for-page";
import { BookingProvider } from '@/context/booking-context';

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
    notFound();
  }
  
  const subdomain = booking.subdomain;
  
  return (
    <BookingProvider initialBooking={booking} subdomain={subdomain}>
      {children}
    </BookingProvider>
  );
}