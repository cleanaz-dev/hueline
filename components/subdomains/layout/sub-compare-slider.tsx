"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ComparisonSlider } from "@/types/booking-page-types";

export default function SubComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  className = "",
  showWatermark = true,
  watermarkUrl = "https://res.cloudinary.com/dmllgn0t7/image/upload/v1760933379/new-watermark.png",
  autoSlide = true,
}: ComparisonSlider) {
  const [position, setPosition] = useState(100); // Start at 100 (right side)
  const [isDragging, setIsDragging] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-slide animation on scroll into view
  useEffect(() => {
    if (!autoSlide || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          setTimeout(() => {
            setPosition(0);
            setTimeout(() => {
              setPosition(50);
            }, 5000); // Increased from 3000 to 5000 (much slower slide)
          }, 800); // Increased from 500 to 800 (longer pause before starting)
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [autoSlide, hasAnimated]);

  // Handle slider position
  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setPosition(Math.min(Math.max(percentage, 0), 100));
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    updatePosition(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div ref={containerRef} className="w-full">
      <div
        className={`relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg border border-primary/20 w-full select-none ${className}`}
        style={{ aspectRatio: "14/10" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* After Image (Background) */}
        <div className="absolute inset-0">
          <Image
            src={afterImage}
            alt={afterLabel}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 transition-all"
          style={{
            clipPath: `inset(0 ${100 - position}% 0 0)`,
            transitionDuration: isDragging ? "0ms" : "1200ms",
            transitionTimingFunction: "ease-in-out",
          }}
        >
          <Image
            src={beforeImage}
            alt={beforeLabel}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Watermark Overlay */}
        {showWatermark && (
          <div
            className="absolute inset-0 pointer-events-none z-[5] rounded-lg sm:rounded-xl"
            style={{
              backgroundImage: `url(${watermarkUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.45,
            }}
          />
        )}

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all cursor-ew-resize z-10"
          style={{
            left: `${position}%`,
            transitionDuration: isDragging ? "0ms" : "1200ms",
            transitionTimingFunction: "ease-in-out",
          }}
        >
          {/* Handle Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-gray-600 absolute left-2" />
            <ChevronRight className="w-4 h-4 text-gray-600 absolute right-2" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 px-2 py-1 sm:px-3 sm:py-1.5 bg-black/70 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold z-10 backdrop-blur-sm">
          {beforeLabel}
        </div>
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 bg-primary text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold z-10 backdrop-blur-sm">
          {afterLabel}
        </div>
      </div>
    </div>
  );
}
