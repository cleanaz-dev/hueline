"use client";
import { ScrollArea } from "../ui/scroll-area";
import CouponQuoteCards from "./quote-card";
import { BookingHero } from "./section/booking-hero";
import BookindgIdCTA from "./booking-id-page/booking-id-cta";
import TransformationGallery from "./booking-id-page/transformation-gallery";
import EmptyState from "./booking-id-page/empty-state";
import Header from "./booking-id-page/booking-page-header";
import ProjectVision from "./booking-id-page/project-vision";
import DesignAnalysis from "./booking-id-page/design-analysis";
import BookingPageFooter from "./booking-id-page/booking-page-footer";

type PaintColor = {
  name: string;
  hex: string;
  ral: string;
  variant?: string;
};

type MockupUrl = {
  url: string;
  room_type: string;
  color: PaintColor;
};

type SharedAccess = {
  email: string;
  accessType: "customer" | "viewer" | "admin";
  pin: string;
  createdAt: string;
};

type Booking = {
  name: string;
  prompt: string;
  original_images: string[];
  mockup_urls: MockupUrl[];
  paint_colors: PaintColor[];
  alternate_colors?: PaintColor[];
  summary: string;
  call_duration?: string;
  phone: string;
  dimensions?: string;
  booking_id?: string;
  sharedAccess?: SharedAccess[];
};

type Props = {
  booking?: Booking | null;
  onRefresh?: () => void;
};

function formatTime(duration?: string): string {
  if (!duration) return "";
  const [minutes, seconds] = duration.split(":").map(Number);
  return `${minutes}m ${seconds}s`;
}

export default function BookingPage({ booking, onRefresh }: Props) {
  // Show empty state if no booking data
  if (!booking) {
    return <EmptyState onRefresh={onRefresh} />;
  }

  // Validate required data
  const hasValidData =
    booking.name &&
    booking.prompt &&
    booking.original_images?.length > 0 &&
    booking.mockup_urls?.length > 0;

  if (!hasValidData) {
    return <EmptyState onRefresh={onRefresh} />;
  }

  return (
    <ScrollArea>
      <div className="min-h-screen bg-gradient-to-b from-primary/30 via-secondary/05 to-primary/30">
        {/* Header with Logo */}
        <Header />
        <main className="max-w-6xl mx-auto px-2 md:px-12 space-y-12 py-4 md:py-8">
          {/* Hero Section */}
          <BookingHero booking={booking} formatTime={formatTime} />
          {/* Project Vision */}
          <ProjectVision booking={booking} />

          {/* Before & After Images */}
          <TransformationGallery
            original_images={booking.original_images}
            mockup_urls={booking.mockup_urls}
            paint_colors={booking.paint_colors}
            alternate_colors={booking.alternate_colors} // ← Do you have this?
            bookingId={booking.booking_id}
            phone={booking.phone}
            sharedAccess={booking.sharedAccess}
          />
          {/* Design Summary */}
          <DesignAnalysis booking={booking} />

          <CouponQuoteCards booking={booking} />

          {/* Call to Action */}
          <BookindgIdCTA />
        </main>

        {/* Footer */}
        <BookingPageFooter />
      </div>
    </ScrollArea>
  );
}
