"use client";
import React, { useState } from "react";
import Image from "next/image";
import Logo from "@/public/images/logo1.png";
import MascotImage from "@/public/images/mascot.png";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import GenerateDialog from "./generate-dialog";
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
  Clock,
} from "lucide-react";
import ThemeChanger from "@/hooks/use-theme-changer";
import Link from "next/link";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

type PaintColor = {
  name: string;
  hex: string;
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
};

type Props = {
  booking?: Booking | null;
  onRefresh?: () => void;
};

const formatCallDuration = (duration: string) => {
  if (!duration) return '';
  
  // Parse "1:59" format
  const [minutes, seconds] = duration.split(':').map(Number);
  
  if (minutes === 0) {
    return `${seconds} seconds`;
  } else if (seconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${seconds}s`;
  }
};


// Empty State Component
function EmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src={Logo}
                alt="HueLine Logo"
                className="object-contain h-10 w-10"
              />
              <span className="text-xl font-semibold text-primary italic">
                HueLine
              </span>
            </div>
            <div className="flex items-center">
              <ThemeChanger />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20">
                <AlertCircle className="h-12 w-12 text-primary/60" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Painting Report Not Available
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                The design report you&apos;re looking for may have expired or is
                no longer available in our cache.
              </p>
            </div>

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

            <div className="pt-8">
              <Image
                src={MascotImage}
                alt="HueLine Mascot"
                className="object-contain size-40 mx-auto opacity-60"
              />
            </div>

            <div className="bg-background/60 rounded-xl p-6 max-w-md mx-auto border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Design reports are temporarily stored and may expire after a
                period of time.
              </p>
            </div>
          </div>
        </main>

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

  if (!booking) {
    return <EmptyState onRefresh={onRefresh} />;
  }

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
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src={Logo}
                alt="HueLine Logo"
                className="object-contain h-10 w-10"
              />
              <span className="text-xl font-semibold text-primary italic">
                HueLine
              </span>
            </div>
            <div className="flex items-center">
              <ThemeChanger />
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-2 md:px-12 space-y-12 py-8">
          {/* Hero Section with Call Duration */}
          <section className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Painting Report
              </h1>
              <p className="text-xl text-muted-foreground">
                Prepared for {booking.name}
              </p>
              {booking.call_duration && (
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Call completed in {formatCallDuration(booking.call_duration)}
                  </span>
                </div>
              )}
            </div>

            <div className="inline-flex items-center justify-center gap-3 bg-muted/80 p-4 rounded-xl max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src="/images/agent-avatar.png" />
                  <AvatarFallback>AN</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-base md:text-sm font-medium">
                    By: Annalia
                  </p>
                  <p className="text-base md:text-sm text-muted-foreground">
                    HueLine Senior Design Consultant
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Project Vision */}
          <section>
            <div className="bg-background rounded-2xl shadow-sm border border-primary/10 py-8 px-6 md:px-8 md:py-10">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <h2 className="ml-3 text-2xl font-semibold">Project Vision</h2>
              </div>
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <p className="text-lg italic leading-relaxed">
                  {`"${booking.prompt}"`}
                </p>
              </div>
            </div>
          </section>

          {/* Before & After Images */}
          <section className="bg-primary/5 rounded-2xl py-8 px-4 md:px-8 md:py-10">
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
                        <div className="text-primary-foreground px-4 py-2 rounded-r-lg shadow-lg font-semibold text-sm uppercase tracking-wide">
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
                        <div className="text-primary-foreground px-4 py-2 rounded-r-lg shadow-lg font-semibold text-sm uppercase tracking-wide">
                          <span className="flex items-center gap-2">
                            Design {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show alternate mockup if it exists */}
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
                        <div className="bg-gradient-to-r from-primary/50 to-primary/25 text-secondary-foreground px-4 py-2 rounded-r-lg shadow-lg font-semibold text-sm uppercase tracking-wide">
                          <span className="flex items-center gap-2">
                        
                            New Design
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Paint Color Palette */}
          {booking.paint_colors && booking.paint_colors.length > 0 && (
            <section className="bg-background rounded-2xl py-8 px-4 md:px-8 md:py-10">
              <div className="flex items-center mb-8">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <h2 className="ml-3 text-2xl font-semibold">Paint Colors</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {booking.paint_colors.map((color, index) => (
                  <div key={index} className="group">
                    <div className="relative overflow-hidden rounded-xl border border-primary/10">
                      <div
                        className="w-full h-32 transition-all duration-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="p-4 bg-background">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{color.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {color.hex}
                            </p>
                          </div>
                          <PaintBucket className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hue Engine Section */}
          {booking.alternate_colors && booking.alternate_colors.length > 0 && (
            <section className="bg-primary/5 rounded-2xl py-8 px-6 md:px-8 md:py-10">
              <div className="flex items-center mb-8">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h2 className="ml-3 text-2xl font-semibold">Hue Engine</h2>
                <div className="ml-auto">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    AI POWERED
                  </span>
                </div>
              </div>

              {booking.alt_mockup_url ? (
                /* Disabled state when alternate image exists */
                <div className="text-center space-y-4 opacity-60">
                  <p className="text-muted-foreground">
                    Alternative design has been generated! The Hue Engine is now complete.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pointer-events-none">
                    {booking.alternate_colors.map((color, index) => (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-xl border-2 border-muted"
                      >
                        <div
                          className="w-full h-24"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="p-3 bg-background">
                          <div className="text-center">
                            <p className="font-medium text-sm text-muted-foreground">{color.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {color.hex}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Button disabled size="lg" className="opacity-50">
                      <Zap className="h-4 w-4 mr-2" />
                      Already Generated
                    </Button>
                  </div>
                </div>
              ) : (
                /* Active state when no alternate image */
                <>
                  <p className="text-muted-foreground mb-6">
                    Explore alternative color options for your space. Select a color
                    below and generate a new mockup instantly.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {booking.alternate_colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`group cursor-pointer relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                          selectedColor?.hex === color.hex
                            ? "border-primary shadow-lg scale-105"
                            : "border-primary/20 hover:border-primary/40"
                        }`}
                      >
                        <div
                          className="w-full h-24 transition-all duration-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="p-3 bg-background">
                          <div className="text-center">
                            <p className="font-medium text-sm">{color.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {color.hex}
                            </p>
                          </div>
                        </div>
                        {selectedColor?.hex === color.hex && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Zap className="h-3 w-3" />
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
                      className="group inline-flex items-center gap-3 px-8"
                    >
                      <Zap className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      Generate Mockup
                    </Button>
                  </div>
                </>
              )}
            </section>
          )}


          {/* Generate Dialog */}
          <GenerateDialog
            isOpen={showGenerateDialog}
            onClose={() => setShowGenerateDialog(false)}
            selectedColor={selectedColor}
            phoneNumber={booking.phone || ""}
            originalImages={booking.original_images}
          />

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

          {/* Call to Action */}
          <section>
            <div className="bg-background rounded-2xl shadow-sm border border-primary/10 py-8 px-4 text-center">
              <h2 className="text-2xl font-bold mb-4 text-balance">
                Ready to Transform Your Space?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Schedule a consultation with our design experts to bring your
                vision to life
              </p>
              <Image
                src={MascotImage}
                alt="hueline-mascot"
                className="object-contain size-32 mx-auto mb-6"
              />
              <Button
                size="lg"
                className="group inline-flex items-center justify-center bg-primary hover:bg-secondary/90 text-primary-foreground font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                asChild
              >
                <Link href="/booking">
                  Get This AI Voice Agent for Your Business
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </section>
        </main>

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
