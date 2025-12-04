"use client";
import { Button } from "@/components/ui/button";
import { Phone, Star } from "lucide-react";
import videoThumbnail from "@/public/images/thumbnail-image-3.jpg";
import Link from "next/link";

export function HeroSection() {
  return (
    <section id="hero" className="relative h-screen sm:h-auto flex flex-col overflow-hidden mt-2 md:mt-6 pb-24 sm:pb-12">
      {/* Ratings */}
      <div className="flex flex-col md:flex-row text-center justify-center items-center gap-2 py-6 relative z-10">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <Star className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
          <span className="ml-1 text-xs md:text-sm text-slate-600">
            4.9/5 rating
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-6xl mx-auto w-full">
        {/* Text Content */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-shadow-sm/50 text-shadow-primary text-balance mb-6 text-black">
            AI answers, <span className="text-primary"> paints their room, </span>books the job—while you work.
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 text-slate-600 muted-foreground">
            Stop paying $300 a mock-up. Hue-Line: unlimited AI visuals + 24/7
            AI voice agent for <span className="font-bold">$1,499/mo.</span>
          </p>

          <Button size="lg" className="bg-primary" asChild>
            <Link href="/booking">
              <Phone className="mr-2 h-5 w-5" />
              Book A Call Today!
            </Link>
          </Button>
        </div>

        {/* Video */}
        <div className="w-full max-w-4xl">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl">
            <video
              className="w-full h-full rounded-lg object-cover"
              controls
              playsInline
              preload="metadata"
              poster={videoThumbnail.src}
            >
              <source
                src="https://hue-line.s3.us-east-1.amazonaws.com/video.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}