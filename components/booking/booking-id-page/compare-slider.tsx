"use client";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { useEffect, useState, useRef } from "react";

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  showWatermark?: boolean;
  watermarkUrl?: string;
  autoSlide?: boolean;
}

export default function ComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  className = "",
  showWatermark = true,
  watermarkUrl = "https://res.cloudinary.com/dmllgn0t7/image/upload/v1760933379/new-watermark.png",
  autoSlide = true,
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(100); // Start at 100 (right side)
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoSlide || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Slide from 100 (right) to 0 (left) then back to 50 (middle)
          setTimeout(() => {
            setPosition(0);

            setTimeout(() => {
              setPosition(50);
            }, 3000); // Pause at 0 for 1.5s
          }, 300); // Start after 300ms
        }
      },
      { threshold: 0.7 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [autoSlide, hasAnimated]);

  return (
    <div ref={containerRef} className="w-full">
      <div 
        className={`relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg border border-primary/20 w-full ${className}`}
        style={{ 
          aspectRatio: "14/10",
        }}
      >
        <ReactCompareSlider
          position={position}
          onPositionChange={setPosition}
          itemOne={
            <ReactCompareSliderImage
              src={beforeImage}
              alt={beforeLabel}
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={afterImage}
              alt={afterLabel}
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
            />
          }
          style={{
            width: "100%",
            height: "100%",
          }}
          className="rounded-lg sm:rounded-xl"
          onlyHandleDraggable={false}
          transition="1.5s ease-in-out"
        />

        {/* Watermark Overlay */}
        {showWatermark && (
          <div 
            className="absolute inset-0 pointer-events-none z-[5] rounded-lg sm:rounded-xl"
            style={{
              backgroundImage: `url(${watermarkUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.45,
            }}
          />
        )}

        {/* Comparison Labels - Responsive */}
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