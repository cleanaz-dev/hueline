"use client";

import { ScrollArea } from "../ui/scroll-area";
import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";
import SubProjectVision from "./layout/sub-project-vision";
import { SubBookingHero } from "./layout/sub-booking-hero";
import SubTransformationGallery from "./layout/sub-transformation-gallery";
import SubDesignSummary from "./layout/sub-design-summary";
import { SubCouponQuoteCards } from "./layout/sub-coupon-quote-card";
import SubdomainNav from "./layout/subdomain-nav";

type Props = {
  booking: BookingData;
  subdomain: SubdomainAccountData;
};

function formatTime(duration?: string | null): string {
  if (!duration) return "";
  const [minutes, seconds] = duration.split(":").map(Number);
  return `${minutes}m ${seconds}s`;
}

export default function SubDomainIdPage({ booking, subdomain }: Props) {
  
  return (
    <ScrollArea>
      <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
        
        {/* Navigation */}
        <SubdomainNav data={subdomain} miniNav={true} />

        <main className="max-w-6xl mx-auto px-2 md:px-12 space-y-12 py-4 md:py-8">
          {/* Hero Section */}
          <SubBookingHero 
            booking={booking} 
            formatTime={formatTime} 
            slug={subdomain.slug} 
          />

          {/* Project Vision */}
          <SubProjectVision booking={booking} />

          {/* Before & After Images - This will now only render when URLs are ready */}
          <SubTransformationGallery booking={booking} />

          {/* Design Summary */}
          <SubDesignSummary booking={booking} />

          {/* Quote Cards */}
          <SubCouponQuoteCards booking={booking} />
        </main>
      </div>
    </ScrollArea>
  );
}