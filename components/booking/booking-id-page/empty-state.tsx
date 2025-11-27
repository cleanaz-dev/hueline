"use client"

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ThemeChanger from "@/hooks/use-theme-changer";
import { AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/images/logo-2--increased-brightness.png";
import MascotImage from "@/public/images/mascot-new.png";

export default function EmptyState({ onRefresh }: { onRefresh?: () => void }) {

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