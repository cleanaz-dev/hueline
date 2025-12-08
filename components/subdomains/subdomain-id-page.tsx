// components/subdomains/subdomain-id-page.tsx
"use client";
import { useState } from "react";
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
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    const handleOpenShareDialog = () => {
    setIsShareDialogOpen(true);
  };


  return (
    <ScrollArea>
      <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
        {/* Header with Logo */}
       <SubdomainNav data={subdomain}/>

        <main className="max-w-6xl mx-auto px-2 md:px-12 space-y-12 py-4 md:py-8">
          {/* Hero Section */}
          <SubBookingHero booking={booking} formatTime={formatTime} slug={subdomain.slug} />

          {/* Project Vision */}
          <SubProjectVision booking={booking} />

          {/* Before & After Images */}
          <SubTransformationGallery booking={booking} />

          {/* Design Summary */}
          <SubDesignSummary booking={booking} />

          <SubCouponQuoteCards booking={booking} />
        </main>

        {/* Footer */}
        {/* <footer className="border-t border-primary/10 bg-background mt-12">
          <div className="max-w-6xl mx-auto px-6 py-2 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src={logoUrl}
                alt={`${subdomain.slug} Logo`}
                className="object-contain"
                width={subdomain.logoWidth || 130}
                height={subdomain.logoHeight || 130}
              />
            </div>
            
          </div>
        </footer> */}

      </div>
    </ScrollArea>
  );
}
