"use client";
import { Button } from "@/components/ui/button";
import { Play, Phone, Star } from "lucide-react";
import Image from "next/image";
import videoThumbnail from "@/public/images/hero1.png";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative h-screen flex flex-col overflow-hidden">


      <div className="flex text-center justify-center items-center mt-2 md:mt-0 md:gap-6 py-2 md:py-0 relative z-10 flex-shrink-0 space-y-2">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full border-2 border-background"></div>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-secondary rounded-full border-2 border-background"></div>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-accent rounded-full border-2 border-background"></div>
          </div>
          <span className="ml-3 text-xs md:text-sm text-foreground/70">
            500+ painters & homeowners
          </span>
        </div>
        <div className="md:flex items-center gap-1 hidden">
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

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-6xl md:max-w-4xl mx-auto min-h-0">
        <div className="flex-shrink-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-shadow-sm/50 text-shadow-primary text-balance mb-3 md:mb-6">
            Give Every Customer a Paint Expert - Even When You&apos;re Busy
          </h1>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 md:mb-8 text-muted-foreground">
            Send photos, get instant paint recommendations, visualize changes,
            and redesign your space - all over the phone with our AI voice
            agent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 md:mb-8">
            <Button size="lg" className="" asChild>
              <Link href="/booking">
                <Phone className="mr-2 h-5 w-5" />
                Book A Call with Paul
              </Link>
            </Button>
          </div>
        </div>
        {/* Video container with strict 16:9 aspect ratio */}
        <div className="w-full max-w-4xl flex-1 min-h-0 flex items-center justify-center pb-4">
          <div className="relative bg-primary backdrop-blur-sm rounded-lg  p-2 md:p-4 w-full">
            {/* 16:9 aspect ratio container */}
            <div className="relative w-full aspect-video rounded-lg flex items-center justify-center border border-muted overflow-hidden">
              <Image
                src={videoThumbnail}
                alt="HueLine AI voice agent demo for painting contractors"
                className="rounded-lg object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />

              {/* Play button overlay - optional */}
              <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                  <Play
                    className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1"
                    fill="currentColor"
                  />
                </div>
              </div>
            </div>
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
