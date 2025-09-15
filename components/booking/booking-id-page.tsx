"use client";
import React from "react";
import Image from "next/image";
import Logo from "@/public/images/logo1.png";
import MascotImage from "@/public/images/mascot.png";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Palette,
  Lightbulb,
  Sparkles,
  ChevronRight,
  PaintBucket,
  Eye,
} from "lucide-react";
import ThemeChanger from "@/hooks/use-theme-changer";
import Link from "next/link";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

type Booking = {
  name: string;
  prompt: string;
  original_images: string[];
  mockup_urls: string[];
  paint_colors: string[];
  summary: string;
};

type Props = {
  booking: Booking;
};

export default function BookingPage({ booking }: Props) {
  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-b from-primary/15 via-secondary/05 to-primary/30">
        {/* Header with Logo */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm ">
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
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Painting Report
              </h1>
              <p className="text-xl text-muted-foreground">
                Prepared for {booking.name}
              </p>
            </div>

            <div className="inline- items-center justify-center gap-3 bg-muted/50 p-4 rounded-xl max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src="/images/agent-avatar.png" />
                  <AvatarFallback>AN</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-base md:text-sm font-medium">By: Annalia</p>
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
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <span className="text-background text-sm font-medium">
                          Image {index + 1}
                        </span>
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
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <span className="text-background text-sm font-medium">
                          Design {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Design Summary */}
          <section>
            <div className="bg-background rounded-2xl shadow-sm border border-primary/10 py-8 px-6 md:px-8 md:py-10">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h2 className="ml-3 text-2xl font-semibold">Design Analysis</h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p>{booking.summary}</p>
              </div>
            </div>
          </section>

          {/* Paint Color Palette */}
          <section className="bg-primary/5 rounded-2xl   py-8 px-4 md:px-8 md:py-10">
            <div className="flex items-center mb-8">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <h2 className="ml-3 text-2xl font-semibold">
                Recommended Paint Colors
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {booking.paint_colors.map((color, index) => (
                <div key={index} className="group">
                  <div className="relative overflow-hidden rounded-xl border border-primary/10">
                    <div
                      className="w-full h-32 transition-all duration-300"
                      style={{ backgroundColor: color }}
                    />
                    <div className="p-4 bg-background">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{color}</span>
                        <PaintBucket className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section>
            <div className="bg-background rounded-2xl shadow-sm border border-primary/10  py-8 px-4 text-center">
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
                  Schedule Consultation
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
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
