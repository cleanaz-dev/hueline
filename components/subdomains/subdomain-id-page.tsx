"use client";

import { ScrollArea } from "../ui/scroll-area";
import { BookingData, SubdomainAccountData } from "@/types/subdomain-type";
import SubProjectVision from "./layout/sub-project-vision";
import { SubBookingHero } from "./layout/sub-booking-hero";
import SubTransformationGallery from "./layout/sub-transformation-gallery";
import SubDesignSummary from "./layout/sub-design-summary";
import { SubCouponQuoteCards } from "./layout/sub-coupon-quote-card";
import SubdomainNav from "./layout/subdomain-nav";
import { BookingCTA } from "./layout/booking-cta";
import { SurveyNudge } from "./layout/survey-nudge"; // <--- Import logic

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
    <ScrollArea className="h-screen w-full">
      <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/25">
        
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

          {/* Transformation Gallery */}
          <SubTransformationGallery booking={booking} />

          {/* Design Summary */}
          <SubDesignSummary booking={booking} />

          {/* Quote Cards (Added ID for the nudge to scroll to) */}
          <div id="quote-survey-section" className="scroll-mt-24">
            <SubCouponQuoteCards booking={booking} />
          </div>

          {/* CTA */}
          <BookingCTA />
        </main>
        
        {/* The Nudge Widget (Fixed Position) */}
        <SurveyNudge booking={booking} />
        
      </div>
    </ScrollArea>
  );
}