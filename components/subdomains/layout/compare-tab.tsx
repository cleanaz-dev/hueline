import SubComparisonSlider from "./sub-compare-slider";
import { BookingData } from "@/types/subdomain-type";

interface CompareTabProps {
  beforeImage: string;
  afterImage: string;
  mockupUrls: BookingData["mockups"];
  selectedDesignImage: number;
  onColorSelect: (index: number) => void;
}

export default function CompareTab({
  beforeImage,
  afterImage,
  mockupUrls,
  selectedDesignImage,
  onColorSelect,
}: CompareTabProps) {
  return (
    <div className="relative h-full w-full">
      <SubComparisonSlider
        key={selectedDesignImage}
        beforeImage={beforeImage}
        afterImage={afterImage}
        beforeLabel="Current Space"
        afterLabel="New Design"
      />

      {/* Floating Color Configurator (Automotive Style) */}
      <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white/50 backdrop-blur-md p-1.5 md:p-3 rounded-2xl shadow-xl border border-white/50 flex gap-4 md:gap-3 overflow-x-auto max-w-[90%] ">
        {mockupUrls.map((mockup, index) => (
          <button
            key={index}
            onClick={() => onColorSelect(index)}
            className={`group relative size-6 md:size-10 rounded-full border-2 transition-all duration-300 shrink-0 cursor-pointer ${
              selectedDesignImage === index
                ? "border-primary scale-110 shadow-lg"
                : "border-white shadow-sm hover:scale-105"
            }`}
            style={{ backgroundColor: mockup.colorHex }}
            title={`${mockup.colorName} - ${mockup.colorRal}`}
          >
            {selectedDesignImage === index && (
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}