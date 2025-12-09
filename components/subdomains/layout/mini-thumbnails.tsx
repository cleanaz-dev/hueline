import Image from "next/image";
import type { MiniThumbnails } from "@/types/booking-page-types";



export default function MiniThumbnails({
  activeTab,
  originalImages,
  mockupUrls,
  selectedOriginalImage,
  selectedDesignImage,
  onOriginalSelect,
  onDesignSelect,
}: MiniThumbnails) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-widest">
          Available Variations
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1 pt-2">
        {activeTab === "original"
          ? originalImages.map((img, i) => (
              <button
                key={i}
                onClick={() => onOriginalSelect(i)}
                className={`relative w-24 h-24 rounded-xl overflow-hidden transition-all ${
                  selectedOriginalImage === i
                    ? "ring-2 ring-primary ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="thumb" fill className="object-cover" />
              </button>
            ))
          : mockupUrls.map((mockup, i) => (
              <button
                key={i}
                onClick={() => onDesignSelect(i)}
                className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden transition-all border bg-gray-50 ${
                  selectedDesignImage === i
                    ? "ring-2 ring-primary ring-offset-2 border-transparent"
                    : "border-gray-200 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={mockup.presignedUrl || mockup.s3Key}
                  alt="thumb"
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute bottom-0 inset-x-0 h-1.5"
                  style={{ background: mockup.colorHex }}
                />
              </button>
            ))}
      </div>
    </div>
  );
}