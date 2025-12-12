"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { BsBadge8K, BsBadge4K } from "react-icons/bs";
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

export default function ExportOptionsDialog({
  isOpen,
  onClose,
  booking,
}: ExportOptionsDialogProps) {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [resolution, setResolution] = useState<"4k" | "8k">("4k");
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
      // Get selected mockup S3 keys
      const selectedMockups = selectedImages.map((i) => mockupUrls[i]);
      const imageKeys = selectedMockups.map((mockup) => mockup.s3Key);

      // Get phone from booking
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageKeys,
            resolution,
            phone,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Export Images</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select images and resolution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {mockupUrls.map((mockup, i) => (
              <button
                key={i}
                onClick={() => toggleImageSelection(i)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                  selectedImages.includes(i)
                    ? "ring-4 ring-primary ring-offset-2"
                    : "ring-1 ring-gray-200 hover:ring-gray-300"
                }`}
              >
                <Image
                  src={mockup.presignedUrl || mockup.s3Key}
                  alt={`Design ${i + 1}`}
                  fill
                  className="object-cover"
                />
                {selectedImages.includes(i) && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      ✓
                    </div>
                  </div>
                )}
                <div
                  className="absolute bottom-0 inset-x-0 h-2"
                  style={{ background: mockup.colorHex }}
                />
              </button>
            ))}
          </div>

          {/* Resolution Selector */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">
              Resolution
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setResolution("4k")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  resolution === "4k"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <BsBadge4K className="w-8 h-8 text-gray-600" />
                <div className="text-left">
                  <div className="font-bold text-gray-900">4K</div>
                  <div className="text-xs text-gray-500">3840 × 2160</div>
                </div>
              </button>

              <button
                onClick={() => setResolution("8k")}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  resolution === "8k"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <BsBadge8K className="w-8 h-8 text-gray-600" />
                <div className="text-left">
                  <div className="font-bold text-gray-900">8K</div>
                  <div className="text-xs text-gray-500">7680 × 4320</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end">
        
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              size="lg"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={selectedImages.length === 0 || isExporting}
              size="lg"
            >
              {isExporting ? "Processing..." : "Export"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
