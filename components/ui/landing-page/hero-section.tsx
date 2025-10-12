"use client";
import { Button } from "@/components/ui/button";
import { Phone, Star } from "lucide-react";
import videoThumbnail from "@/public/images/vid-thumbnail-min.png";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative md:min-h-screen min-h-[600px] flex flex-col overflow-hidden mt-2 md:mt-6">
      {/* Ratings */}
      <div className="hidden md:flex flex-col md:flex-row text-center justify-center items-center mt-2 md:mt-0 md:gap-6 py-2 md:py-0 relative z-10 flex-shrink-0 gap-2">
        {/* <div className="flex items-center">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full border-2 border-background"></div>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-secondary rounded-full border-2 border-background"></div>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-accent rounded-full border-2 border-background"></div>
          </div>
          <span className="ml-3 text-xs md:text-sm text-foreground/70">
            200+ painters & homeowners
          </span>
        </div> */}
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <span className="ml-1 text-xs md:text-sm text-foreground/70">
            4.9/5 rating
          </span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-6xl md:max-w-4xl mx-auto min-h-0 mt-4 md:mt-0">
        {/* Hero Main Area Text */}
        <div className="flex-shrink-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-shadow-sm/50 text-shadow-primary text-balance mb-3 md:mb-6">
            AI answers, <span className="text-primary"> paints their room, </span>books the job—while you work.
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 md:mb-8 text-muted-foreground">
            Stop paying $300 a mock-up. Hue-Line: unlimited AI visuals + 24/7
            phone agent for <span className="font-bold">$999/mo.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-primary" asChild>
              <Link href="/booking">
                <Phone className="mr-2 h-5 w-5" />
                Book A Call Today!
              </Link>
            </Button>
          </div>
        </div>

        {/* Video container with strict 16:9 aspect ratio */}
        <div className="w-full max-w-4xl flex-1 min-h-0 flex items-center justify-center pb-4">
          <div className="relative w-full aspect-video rounded-lg flex items-center justify-center overflow-hidden">
            <video
              className="w-full h-full rounded-lg object-cover"
              controls
              playsInline
              preload="metadata"
              poster={videoThumbnail.src}
            >
              <source
                src="https://hue-line.s3.us-east-1.amazonaws.com/final-v3__1.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      {/* Additional CSS for custom animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
