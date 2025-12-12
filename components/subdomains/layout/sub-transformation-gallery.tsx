"use client";
import { Eye, Sparkles } from "lucide-react";
import { useState } from "react";
import SubAlternateDesign from "./sub-alternate-colors";
import { BookingData } from "@/types/subdomain-type";
import VisionTab from "./vision-tab";
import CompareTab from "./compare-tab";
import MiniThumbnails from "./mini-thumbnails";
import ExportOptions from "./export-options";
import ExportOptionsDialog from "./export-options-dialog";
import { useBooking } from "@/context/booking-context";

interface SubTransformationGalleryProps {
  booking: BookingData;
}

export default function SubTransformationGallery({
  booking,
}: SubTransformationGalleryProps) {
  const [activeTab, setActiveTab] = useState<"original" | "design">("original");
  const [selectedOriginalImage, setSelectedOriginalImage] = useState(0);
  const [selectedDesignImage, setSelectedDesignImage] = useState(0);

  const mockupUrls = booking.mockups || [];
  const selectedMockup = mockupUrls[selectedDesignImage];
  const hasGeneratedImage = mockupUrls.length > 1;
  const hasSharedAccess = !!booking.sharedAccess?.length;

  // Ensure array format
  const originalImagesArray = [booking.originalImages];

  const { isExportDialogOpen, setIsExportDialogOpen } = useBooking()

  return (
    <section className="w-full max-w-6xl mx-auto space-y-8 py-8">
      {/* 1. Cinematic Header & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xs font-bold  uppercase tracking-widest">
              Visualization Studio
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Transformation <span className="text-primary">Gallery</span>
          </h2>
        </div>

        {/* Premium Segmented Toggle */}
        <div className="bg-gray-100 p-1.5 rounded-full inline-flex items-center shadow-inner">
          <button
            onClick={() => setActiveTab("original")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeTab === "original"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Eye className="w-4 h-4" />
            Compare
          </button>
          <button
            onClick={() => setActiveTab("design")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeTab === "design"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Vision
          </button>
        </div>
      </div>

      {/* 2. The "Stage" (Main Viewport) */}
      <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative ">
        {/* --- TAB: COMPARE --- */}
        <div
          className={`transition-opacity duration-500 ${
            activeTab === "original"
              ? "opacity-100"
              : "opacity-0 absolute inset-0 pointer-events-none"
          }`}
        >
          {mockupUrls.length > 0 && originalImagesArray.length > 0 && (
            <CompareTab
              beforeImage={originalImagesArray[selectedOriginalImage]}
              afterImage={selectedMockup?.presignedUrl || selectedMockup?.s3Key}
              mockupUrls={mockupUrls}
              selectedDesignImage={selectedDesignImage}
              onColorSelect={setSelectedDesignImage}
            />
          )}
        </div>

        {/* --- TAB: VISION (High Fidelity) --- */}
        <div
          className={`transition-opacity duration-500 h-full ${
            activeTab === "design"
              ? "opacity-100"
              : "opacity-0 absolute inset-0 pointer-events-none"
          }`}
        >
          <VisionTab selectedMockup={selectedMockup} />
        </div>
      </div>

      {/* 3. Thumbnails & Alternates (Below the Stage) */}
      <div className="">
        {/* Thumbnails */}
        <div className="flex justify-between">
          <MiniThumbnails
            activeTab={activeTab}
            originalImages={originalImagesArray}
            mockupUrls={mockupUrls}
            selectedOriginalImage={selectedOriginalImage}
            selectedDesignImage={selectedDesignImage}
            onOriginalSelect={setSelectedOriginalImage}
            onDesignSelect={setSelectedDesignImage}
          />
          <ExportOptions />
        </div>

        {/* Alternate Design Link (Clean Sidebar) */}
        <div className="">
          <ExportOptionsDialog
            isOpen={isExportDialogOpen}
            onClose={() => setIsExportDialogOpen(false)}
            booking={booking}
          />
          <SubAlternateDesign
            booking={booking}
            hasGeneratedImage={hasGeneratedImage}
            hasSharedAccess={hasSharedAccess}
          />
        </div>
      </div>
    </section>
  );
}
