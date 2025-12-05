"use client";
import { ReactCompareSlider, ReactCompareSliderImage, ReactCompareSliderHandle } from "react-compare-slider";
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

// Custom hook for media query
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
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
  const [position, setPosition] = useState(100);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detect if desktop (768px and above)
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
            }, 3000);
          }, 500);
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
          aspectRatio: isDesktop ? "14/10" : "3/4", // Desktop: 14/10, Mobile: 3/4
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
          handle={
            <ReactCompareSliderHandle
              linesStyle={{
                opacity: 0.5
              }}
            />
          }
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