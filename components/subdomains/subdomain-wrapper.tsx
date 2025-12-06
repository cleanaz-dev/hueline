"use client";

import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";
import { BookingProvider } from "@/context/booking-context";
import { SubDomainContent } from "./subdomain-content";

type Props = {
  booking: BookingData;
  subdomain: SubdomainAccountData;
};

export function SubDomainWrapper({ booking, subdomain }: Props) {
  return (
    <BookingProvider initialBooking={booking} subdomain={subdomain}>
      {/* We move the UI logic into a child component so it can use the hook */}
      <SubDomainContent />
    </BookingProvider>
  );
}