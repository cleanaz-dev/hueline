"use client";
import React, { useState } from "react";
import Image from "next/image";
import Logo from "@/public/images/logo-2--increased-brightness.png";
import {
  Palette,
  Lightbulb,
  Sparkles,
  ChevronRight,
  PaintBucket,
  Eye,
  AlertCircle,
  RefreshCw,
  Zap,
  Sofa,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import GenerateDialog from "./generate-dialog";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import CouponQuoteCards from "./quote-card";
import { BookingHero } from "./section/booking-hero";
import BookindgIdCTA from "./booking-id-page/booking-id-cta";
import TransformationGallery from "./booking-id-page/transformation-gallery";
import EmptyState from "./booking-id-page/empty-state";

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
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [removeFurniture, setRemoveFurniture] = useState<boolean>(false);

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

  // Check if there's already an alternate mockup generated
  const hasAlternateMockup = booking.mockup_urls.length > 1;

  const handleGenerateAlternate = () => {
    if (!selectedColor) return;
    setShowGenerateDialog(true);
  };
  return (
    <ScrollArea>
      <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
        {/* Header with Logo */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm ">
          <div className="max-w-6xl mx-auto px-6 py-2 md:py-4 flex items-center justify-between">
            <div className="">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src={Logo}
                  alt="HueLine Logo"
                  className="object-contain w-20 md:w-[130px]"
                  width={130}
                  height={130}
                />
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-2 md:px-12 space-y-12 py-4 md:py-8">
          {/* Hero Section */}
          <BookingHero booking={booking} formatTime={formatTime} />

          {/* Project Vision */}
          <section>
            <div className="bg-background rounded-2xl shadow-sm py-8 px-6 md:px-8 md:py-10">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <h2 className="ml-3 text-lg md:text-2xl font-semibold ">
                  Project Vision
                </h2>
              </div>
              <div className="bg-primary/5 rounded-xl p-4 md:p-6 border border-primary/10">
                <p className="md:text-lg italic leading-relaxed">
                  {`"${booking.prompt}"`}
                </p>
              </div>
            </div>
          </section>

          {/* Before & After Images */}
          <TransformationGallery
            original_images={booking.original_images}
            mockup_urls={booking.mockup_urls}
            paint_colors={booking.paint_colors}
            alternate_colors={booking.alternate_colors} // ← Do you have this?
            bookingId={booking.booking_id}
            phone={booking.phone} // ← And this?
          />
          {/* Design Summary */}
          {booking.summary && (
            <section>
              <div className="bg-background rounded-2xl shadow-sm border border-primary/10 py-8 px-6 md:px-8 md:py-10">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="ml-3 text-lg md:text-2xl font-semibold">
                    Design Analysis
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none text-sm md:text-base leading-6 md:leading-normal">
                  <p>{booking.summary}</p>
                </div>
              </div>
            </section>
          )}

          <CouponQuoteCards booking={booking} />

          {/* Call to Action */}
          <BookindgIdCTA />
        </main>

        {/* Footer */}
        <footer className="border-t border-primary/10 bg-background mt-12">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src={Logo}
                alt="HueLine Logo"
                className="object-contain"
                width={130}
                height={130}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Hue-Line AI Voice Agent. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </ScrollArea>
  );
}
