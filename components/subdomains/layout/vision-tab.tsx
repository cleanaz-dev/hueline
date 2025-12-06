import Image from "next/image";
import GlareHover from "@/components/GlareHover";
import { Badge } from "@/components/ui/badge";
import { BookingData } from "@/types/subdomain-type";

interface VisionTabProps {
  selectedMockup: BookingData["mockups"][number];
}

export default function VisionTab({ selectedMockup }: VisionTabProps) {
  return (
    <div className="relative h-full w-full bg-gray-50 flex items-center justify-center p-2 md:p-6">
      <div className="relative w-full max-w-5xl rounded-lg shadow-2xl overflow-hidden group">
        <GlareHover>
          <>
            <Image
              src={selectedMockup?.presignedUrl || selectedMockup?.s3Key}
              alt="Design Vision"
              width={1200}
              height={800}
              className="w-full h-auto object-cover"
              priority
            />
            {/* Subtle Watermark */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(https://res.cloudinary.com/dmllgn0t7/image/upload/v1760933379/new-watermark.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: 0.45,
              }}
            />
          </>
        </GlareHover>

        {/* Image Meta Data Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 flex justify-between items-end text-white">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/70 mb-1">
              Color Palette
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full border border-white"
                style={{ background: selectedMockup?.colorHex }}
              />
              <p className="text-lg font-bold">{selectedMockup?.colorName}</p>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30 border-0"
              >
                {selectedMockup?.colorRal}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}