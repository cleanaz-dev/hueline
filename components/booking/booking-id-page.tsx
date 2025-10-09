"use client";
import React, { useState } from "react";
import Image from "next/image";
import Logo from "@/public/images/logo-w-brand-min.png";
import MascotImage from "@/public/images/mascot.png";
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
import ThemeChanger from "@/hooks/use-theme-changer";
import Link from "next/link";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import GenerateDialog from "./generate-dialog";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import CouponQuoteCards from "./quote-card";
import { BookingHero } from "./section/booking-hero";

type PaintColor = {
  name: string;
  hex: string;
  ral: string;
};

type Booking = {
  name: string;
  prompt: string;
  original_images: string[];
  mockup_urls: string[];
  paint_colors: PaintColor[];
  summary: string;
  call_duration?: string;
  alternate_colors?: PaintColor[];
  alt_mockup_url?: string;
  phone?: string;
  dimensions?: string;
};

type Props = {
  booking?: Booking | null;
  onRefresh?: () => void;
};
function formatTime(duration?: string): string {
  if (!duration) return ""; // or "0m 0s" if you want a default
  const [minutes, seconds] = duration.split(":").map(Number);
  return `${minutes}m ${seconds}s`;
}
// Empty State Component
function EmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
        {/* Header with Logo */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src={Logo}
                alt="HueLine Logo"
                className="object-contain"
                width={120}
                height={120}
              />

            </div>
            <div className="flex items-center">
              <ThemeChanger />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-8">
            {/* Empty State Icon */}
            <div className="flex justify-center">
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20">
                <AlertCircle className="h-12 w-12 text-primary/60" />
              </div>
            </div>

            {/* Empty State Content */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Painting Report Not Available
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                The design report you&apos;re looking for may have expired or is
                no longer available in our cache.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  size="lg"
                  className="group inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                  Try Again
                </Button>
              )}

              <Button
                size="lg"
                className="group inline-flex items-center justify-center bg-primary hover:bg-secondary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/booking">
                  Book a Consultation Today!
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Mascot Image */}
            <div className="pt-8">
              <Image
                src={MascotImage}
                alt="HueLine Mascot"
                className="object-contain size-40 mx-auto opacity-60"
              />
            </div>

            {/* Help Text */}
            <div className="bg-background/60 rounded-xl p-6 max-w-md mx-auto border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Design reports are temporarily stored and may expire after a
                period of time. Please create a new consultation to generate a
                fresh report.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-primary/10 bg-background mt-12">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src={Logo}
                alt="HueLine Logo"
                className="object-contain h-8 w-8"
              />
              <span className="text-lg font-medium italic text-primary">
                HueLine
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HueLine Interior Design. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </ScrollArea>
  );
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

  const handleGenerateAlternate = () => {
    if (!selectedColor) return;
    setShowGenerateDialog(true);
  };

  return (
    <ScrollArea>
      <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
        {/* Header with Logo */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm ">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src={Logo}
                  alt="HueLine Logo"
                  className="object-contain"
                  width={130}
                  height={130}
                />
              </Link>
            </div>
            <div className="flex items-center">
              <ThemeChanger />
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-2 md:px-12 space-y-12 py-8">
          {/* Hero Section */}
          <BookingHero booking={booking} formatTime={formatTime} />

          {/* Project Vision */}
          <section>
            <div className="bg-background rounded-2xl shadow-sm border border-primary/10 py-8 px-6 md:px-8 md:py-10">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <h2 className="ml-3 text-2xl font-semibold ">Project Vision</h2>
              </div>
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <p className="text-lg italic leading-relaxed">
                  {`"${booking.prompt}"`}
                </p>
              </div>
            </div>
          </section>

          {/* Before & After Images */}
          <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-2xl py-8 px-4 md:px-8 md:py-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Transformation Gallery
              </h2>
              <p className="text-muted-foreground">
                Visualizing your space before and after
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Original Images */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/20">
                    <Eye className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="ml-2 text-xl font-semibold">Current Space</h3>
                </div>
                <div className="space-y-6">
                  {booking.original_images.map((image, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-xl shadow-sm border border-primary/10"
                    >
                      <Image
                        src={image}
                        alt={`Original image ${index + 1}`}
                        width={600}
                        height={400}
                        className="w-full h-72 object-cover transition-transform duration-1000 hover:scale-105"
                      />
                      <div className="absolute top-4 left-0">
                        <div className="text-white px-4 py-2 rounded-r-lg shadow-lg bg-card/10 font-semibold text-sm uppercase tracking-wide">
                          <span className="flex items-center gap-2">
                            Original {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup Images */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="ml-2 text-xl font-semibold">Design Vision</h3>
                </div>
                <div className="space-y-6">
                  {booking.mockup_urls.map((image, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-xl shadow-sm border border-primary/10"
                    >
                      <Image
                        src={image}
                        alt={`Mockup design ${index + 1}`}
                        width={600}
                        height={400}
                        className="w-full h-72 object-cover transition-transform duration-1000 hover:scale-105"
                      />
                      <div className="absolute top-4 left-0">
                        <div className="text-white px-4 py-2 rounded-r-lg bg-card/10 shadow-lg font-semibold text-sm uppercase tracking-wide">
                          <span className="flex items-center gap-2">
                            Design {index + 1}
                          </span>
                          {/* <span
                            className="px-2 py-1 rounded"
                            style={{
                              backgroundColor: booking.paint_colors[0].hex,
                            }}
                          >
                            {booking.paint_colors[0].name}
                          </span> */}
                        </div>
                      </div>
                    </div>
                  ))}

                  {booking.alt_mockup_url && (
                    <div className="relative overflow-hidden rounded-xl shadow-sm border border-primary/10">
                      <Image
                        src={booking.alt_mockup_url}
                        alt="Alternative design"
                        width={600}
                        height={400}
                        className="w-full h-72 object-cover transition-transform duration-1000 hover:scale-105"
                      />
                      <div className="absolute top-4 left-0">
                        <div className="bg-gradient-to-r from-red-500/50 via-yellow-300/50 to-indigo-500/50 text-white px-4 py-2 rounded-r-lg shadow-lg font-semibold text-sm uppercase tracking-wide">
                          <span className="flex items-center gap-2">
                            Hue Engine
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Design Summary */}
          {booking.summary && (
            <section>
              <div className="bg-background rounded-2xl shadow-sm border border-primary/10 py-8 px-6 md:px-8 md:py-10">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="ml-3 text-2xl font-semibold">
                    Design Analysis
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p>{booking.summary}</p>
                </div>
              </div>
            </section>
          )}

          {/* Combined Paint Colors & Hue Engine Section */}
          {booking.paint_colors && booking.paint_colors.length > 0 && (
            <section className="bg-card rounded-2xl py-8 px-6 md:px-8 md:py-10">
              <div className="flex items-center mb-8">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <h2 className="ml-3 text-2xl font-semibold">Paint Colors</h2>
              </div>

              {/* Main Paint Colors */}
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {booking.paint_colors.slice(0, 1).map((color, index) => (
                    <div key={index} className="group">
                      <div className="relative overflow-hidden rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                        <div
                          className="w-full h-32 transition-all duration-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="p-4 bg-background">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {color.name}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {color.hex} - {color.ral}
                              </p>
                            </div>
                            <PaintBucket className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hue Engine Section */}
              {booking.alternate_colors &&
                booking.alternate_colors.length > 0 && (
                  <div className="border-t border-primary/10 pt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        HUE ENGINE
                      </h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium uppercase">
                        More Paint Choices
                      </span>
                    </div>

                    {booking.alt_mockup_url ? (
                      /* Disabled state when alternate image exists */
                      <div className="text-center space-y-4 opacity-60">
                        <p className="text-sm text-muted-foreground mb-4">
                          Alternative design has been generated! The Hue Engine
                          is now complete.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pointer-events-none">
                          {booking.alternate_colors.map((color, index) => (
                            <div
                              key={index}
                              className="relative overflow-hidden rounded-lg border-2 border-muted"
                            >
                              <div
                                className="w-full h-16"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="p-2 bg-background">
                                <div className="text-left">
                                  <p className="font-medium text-xs truncate">
                                    {color.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {color.hex} - {color.ral}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center pt-2">
                          <Button disabled size="sm" className="opacity-50">
                            <Zap className="h-3 w-3 mr-2" />
                            Already Generated
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Active state when no alternate image */
                      <>
                        <p className="text-sm text-muted-foreground mb-4">
                          Explore alternative color options for your space.
                          Select a color below and generate a new mockup
                          instantly.
                        </p>

                        {/* Remove Furniture Toggle */}
                        <div className="flex md:max-w-sm items-center justify-center gap-3 mb-6 p-4 bg-background/60 rounded-lg border border-primary/50">
                          <Sofa className="h-4 w-4 text-primary" />
                          <Label
                            htmlFor="remove-furniture"
                            className="text-sm font-medium"
                          >
                            Remove furniture from mockup
                          </Label>
                          <Switch
                            id="remove-furniture"
                            checked={removeFurniture}
                            onCheckedChange={setRemoveFurniture}
                            className="mt-0.5"
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-32 mb-6">
                          {booking.alternate_colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedColor(color)}
                              className={`group cursor-pointer relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                                selectedColor?.hex === color.hex
                                  ? "border-primary shadow-md scale-105"
                                  : "border-primary/20 hover:border-primary/40"
                              }`}
                            >
                              <div
                                className="w-full h-16 transition-all duration-300"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="p-2 bg-background">
                                <div className="text-center">
                                  <p className="font-medium text-xs truncate">
                                    {color.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {color.hex}
                                  </p>
                                </div>
                              </div>
                              {selectedColor?.hex === color.hex && (
                                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                                  <Zap className="h-2 w-2" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-center">
                          <Button
                            onClick={handleGenerateAlternate}
                            disabled={!selectedColor}
                            size="lg"
                            className="group inline-flex items-center gap-2 px-6"
                          >
                            <Zap className="h-3 w-3 group-hover:scale-110 transition-transform" />
                            Generate Mockup
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
            </section>
          )}

          <GenerateDialog
            isOpen={showGenerateDialog}
            onClose={() => setShowGenerateDialog(false)}
            selectedColor={selectedColor}
            phoneNumber={booking.phone || ""}
            originalImages={booking.mockup_urls}
            removeFurniture={removeFurniture}
          />

          <CouponQuoteCards booking={booking} />

          {/* Call to Action */}
          <section>
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 rounded-2xl shadow-sm border border-primary/10  py-8 px-4 text-center">
              <h2 className="text-2xl font-bold mb-4 text-balance">
                Want This AI Agent for Your Painting Business?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Generate instant design mockups, paint color recommendations,
                and professional reports that close more jobs. Let AI handle
                consultations while you focus on painting.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8 md:text-sm">
                <div className="bg-background/60 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center justify-center mb-2">
                    <PaintBucket className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium">AI Design Mockups</p>
                  <p className="text-muted-foreground text-sm md:text-xs">
                    Show clients exactly how their space will look
                  </p>
                </div>
                <div className="bg-background/60 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center justify-center mb-2">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium">Smart Color Alternatives</p>
                  <p className="text-muted-foreground text-sm md:text-xs">
                    Perfect paint colors for every project
                  </p>
                </div>
                <div className="bg-background/60 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center justify-center mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium">24/7 Lead Capture</p>
                  <p className="text-muted-foreground text-sm md:text-xs">
                    Never miss a potential customer again
                  </p>
                </div>
              </div>
              <Image
                src={MascotImage}
                alt="hueline-mascot"
                className="object-contain size-32 mx-auto mb-6"
                priority
              />
              <Button
                size="lg"
                className="group inline-flex items-center justify-center bg-primary hover:bg-secondary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/booking">
                  Get HueLine AI for Your Business
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                🚀 Limited time: Early adopter pricing available
              </p>
            </div>
          </section>
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
              © {new Date().getFullYear()} Hue-Line Interior Design. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </ScrollArea>
  );
}
