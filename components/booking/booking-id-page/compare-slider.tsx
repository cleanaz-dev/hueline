"use client";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export default function ComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  className = "",
}: ComparisonSliderProps) {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg border border-primary/20 w-full ${className}`}
      style={{ 
        aspectRatio: "4/3",
      }}
    >
      <ReactCompareSlider
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
        position={50}
        onlyHandleDraggable={false}
        transition="0.55s cubic-bezier(.17,.67,.83,.67)"
      />

      {/* Comparison Labels - Responsive */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 px-2 py-1 sm:px-3 sm:py-1.5 bg-black/70 text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold z-10 backdrop-blur-sm">
        {beforeLabel}
      </div>
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 px-2 py-1 sm:px-3 sm:py-1.5 bg-primary text-white rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold z-10 backdrop-blur-sm">
        {afterLabel}
      </div>
    </div>
  );
}