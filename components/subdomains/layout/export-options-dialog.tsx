"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { BsBadge8K, BsBadge4K } from "react-icons/bs";
import { IconType } from "react-icons";
import Image from "next/image";
import { BookingData } from "@/types/subdomain-type";
import { useBooking } from "@/context/booking-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ExportOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingData;
}

type Resolution = "4k" | "8k";

interface ResolutionOption {
  value: Resolution;
  label: string;
  dimensions: string;
  icon: IconType;
}

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  {
    value: "4k",
    label: "4K",
    dimensions: "3840 × 2160",
    icon: BsBadge4K,
  },
  {
    value: "8k",
    label: "8K",
    dimensions: "7680 × 4320",
    icon: BsBadge8K,
  },
];

export default function ExportOptionsDialog({
  isOpen,
  onClose,
  booking,
}: ExportOptionsDialogProps) {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [resolution, setResolution] = useState<Resolution>("4k");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const mockupUrls = booking.mockups || [];
  const { subdomain } = useBooking();

  const toggleImageSelection = (index: number) => {
    setSelectedImages((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleExport = async () => {
    if (selectedImages.length === 0) return;

    setIsExporting(true);

    try {
      const selectedMockups = selectedImages.map((i) => mockupUrls[i]);
      const imageKeys = selectedMockups.map((mockup) => mockup.s3Key);
      const phone = booking.phone;

      if (!phone) {
        toast.error("Phone number not found");
        setIsExporting(false);
        return;
      }

      const response = await fetch(
        `/api/subdomain/${subdomain.slug}/booking/${booking.huelineId}/export`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageKeys, resolution, phone }),
        }
      );

      if (!response.ok) throw new Error("Export failed");

      toast.success("Export started! You'll receive an SMS when ready.");
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // 1. CONTAINER: Desktop centers items, Mobile aligns to bottom (items-end)
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* 2. CARD/SHEET: 
          - Mobile: rounded-t-[2rem], full width, fixed height (85vh)
          - Desktop: rounded-2xl, max width, auto height
      */}
      <div className="relative bg-white w-full sm:max-w-2xl 
                      h-[85vh] sm:h-auto sm:max-h-[90vh] 
                      rounded-t-[2rem] sm:rounded-2xl 
                      flex flex-col shadow-2xl overflow-hidden 
                      animate-in slide-in-from-bottom-10 fade-in duration-300">
        
        {/* --- MOBILE GRAB HANDLE (Hidden on Desktop) --- */}
        <div 
          className="sm:hidden w-full flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing" 
          onClick={onClose}
        >
            <div className="w-10 h-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-2 sm:p-6 border-b-0 sm:border-b shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Export Images</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select images and resolution
            </p>
          </div>
          
          {/* DESKTOP CLOSE BUTTON (Hidden on Mobile) */}
          <button
            onClick={onClose}
            className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 sm:pt-6">
          
          {/* Image Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {mockupUrls.map((mockup, i) => (
              <button
                key={i}
                onClick={() => toggleImageSelection(i)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all cursor-pointer group ${
                  selectedImages.includes(i)
                    ? "ring-4 ring-primary ring-offset-2"
                    : "ring-1 ring-gray-200"
                }`}
              >
                <Image
                  src={mockup.presignedUrl || mockup.s3Key}
                  alt={`Design ${i + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {selectedImages.includes(i) && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-in fade-in zoom-in duration-200">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      ✓
                    </div>
                  </div>
                )}
                <div
                  className="absolute bottom-0 inset-x-0 h-1.5 sm:h-2"
                  style={{ background: mockup.colorHex }}
                />
              </button>
            ))}
          </div>

          {/* Resolution Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Output Quality
            </label>
            <div className="flex gap-3">
              {RESOLUTION_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = resolution === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setResolution(option.value)}
                    className={`flex-1 flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`size-8 sm:size-10 ${isSelected ? "text-primary" : "text-gray-400"}`} />
                    <div>
                      <div className={`font-bold ${isSelected ? "text-gray-900" : "text-gray-600"}`}>
                        {option.label}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500">
                        {option.dimensions}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end shrink-0 pb-8 sm:pb-6">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button onClick={onClose} size="lg" variant="outline" className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={selectedImages.length === 0 || isExporting}
              size="lg"
              className="flex-1 sm:flex-none sm:min-w-[140px]"
            >
              {isExporting ? "Processing..." : `Export (${selectedImages.length})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}