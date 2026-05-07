"use client";

import { Palette, Sofa, Zap, Share2, Lock, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiMoonFill, RiSparkling2Line, RiSunFill } from "react-icons/ri";
import { toast } from "sonner";
import GenerateDialog from "@/components/booking/generate-dialog";
import { BookingData } from "@/types/subdomain-type";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/booking-context";
import {
  BrandId,
  BRAND_LABELS,
  COLOR_SHADES,
  PaintColor,
} from "@/lib/config/paint-config";

// --- Paint brand data ---

const BRAND_ORDER: BrandId[] = [
  "sherwin_williams",
  "benjamin_moore",
  "behr",
  "ral",
];

// --- Component ---
interface ComponentProps {
  booking: BookingData;
  hasGeneratedImage: boolean;
}

export default function SubAlternateDesign({
  booking,
  hasGeneratedImage,
}: ComponentProps) {
  const [removeFurniture, setRemoveFurniture] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  // Brand + color state (replaces old selectedShade)
  const [selectedBrand, setSelectedBrand] =
    useState<BrandId>("sherwin_williams");
  const [selectedColor, setSelectedColor] = useState<PaintColor>(
    COLOR_SHADES.sherwin_williams[0],
  );

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const { setIsShareDialogOpen, subdomain } = useBooking();
  const hasSharedAccess = true;

  const options = [
    { id: "brighter", icon: RiSunFill, label: "Brighter" },
    { id: "darker", icon: RiMoonFill, label: "Darker" },
    { id: "trendy", icon: RiSparkling2Line, label: "Trendy" },
    { id: "shade", icon: Palette, label: "Color Shade" },
  ];

  const handleSelectOption = (optionId: string) => {
    if (hasGeneratedImage || !hasSharedAccess) return;
    setSelectedOption(selectedOption === optionId ? "" : optionId);
  };

  const handleBrandChange = (brand: BrandId) => {
    setSelectedBrand(brand);
    setSelectedColor(COLOR_SHADES[brand][0]); // reset to first color in new brand
  };

  const handleGenerateClick = async () => {
    if (!selectedOption || hasGeneratedImage || !hasSharedAccess) return;

    setShowGenerateDialog(true);
    setGenerateStatus("generating");

    const generationPayload = {
      option: selectedOption,
      removeFurniture,
      currentColor: booking.paintColors,
      originalImageS3Key: booking.originalImages,
      // Only populated for "shade"; brighter/darker/trendy leave these undefined
      ...(selectedOption === "shade" && {
        targetColor: {
          brand: selectedBrand,
          brandLabel: BRAND_LABELS[selectedBrand],

          name: selectedColor.name,
          code: selectedColor.code,
          hex: selectedColor.hex,

          family: selectedColor.family,
          tone: selectedColor.tone,
          lightness: selectedColor.lightness,
        },
      }),
    };

    try {
      const response = await fetch(
        `/api/subdomain/${subdomain.slug}/booking/${booking.huelineId}/generate-mockup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(generationPayload),
        },
      );

      if (!response.ok) throw new Error("Failed to generate mockup");
      setGenerateStatus("success");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate mockup");
      setGenerateStatus("error");
      setShowGenerateDialog(false);
    }
  };

  const handleViewDesign = () => {
    setShowGenerateDialog(false);
    window.location.reload();
  };

  // --- Locked view ---
  if (!hasSharedAccess) {
    return (
      <div className="relative h-full min-h-62.5 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">
          Unlock AI Variations
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-50">
          Share this project to generate alternate color options.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsShareDialogOpen(true)}
          className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Share2 className="w-4 h-4" />
          Share to Unlock
        </Button>
      </div>
    );
  }

  // --- Completed view ---
  if (hasGeneratedImage) {
    return (
      <div className="h-full min-h-50 bg-card rounded-xl border border-green-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Design Generated</h3>
        <p className="text-sm text-gray-500 mt-1">
          You have used your free AI generation credit for this session.
        </p>
      </div>
    );
  }

  // --- Active view ---
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Hue-Line Engine
          </h3>
        </div>
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-600 text-[10px]"
        >
          1 Credit Remaining
        </Badge>
      </div>

      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Generate alternative designs with different styles and color
        combinations. Toggle furniture removal for a cleaner preview.
      </p>

      {/* Furniture Switch */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 w-auto md:w-72">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-md shadow-sm text-gray-500">
            <Sofa className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="remove-furniture"
              className="text-sm font-medium cursor-pointer"
            >
              Remove Furniture
            </Label>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-600 bg-blue-50"
            >
              BETA
            </Badge>
          </div>
        </div>
        <Switch
          id="remove-furniture"
          checked={removeFurniture}
          onCheckedChange={setRemoveFurniture}
        />
      </div>

      {/* Option Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-10 mb-4 flex-none">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOption === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer h-[72px]",
                isSelected
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isSelected ? "text-primary" : "text-gray-400",
                )}
              />
              <span className="text-xs font-medium">{option.label}</span>
              {option.id === "trendy" && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Color Shade Panel */}
      {selectedOption === "shade" && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200 flex-1">
          {/* Brand tabs */}
          <Label className="text-[10px] text-gray-500 mb-2 block uppercase tracking-wider font-bold">
            Brand
          </Label>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {BRAND_ORDER.map((brand) => (
              <button
                key={brand}
                onClick={() => handleBrandChange(brand)}
                className={cn(
                  "text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all",
                  selectedBrand === brand
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-400",
                )}
              >
                {BRAND_LABELS[brand]}
              </button>
            ))}
          </div>

          {/* Color swatches for selected brand */}
          <Label className="text-[10px] text-gray-500 mb-2 block uppercase tracking-wider font-bold">
            Color
          </Label>
          <div className="flex gap-2.5 flex-wrap">
            {COLOR_SHADES[selectedBrand].map((color) => (
              <button
                key={color.code}
                onClick={() => setSelectedColor(color)}
                title={`${color.name} (${color.code})`}
                className={cn(
                  "w-8 h-8 rounded-full border-2 shadow-sm transition-all cursor-pointer",
                  selectedColor.code === color.code
                    ? "border-primary scale-110 ring-2 ring-primary/20"
                    : "border-white hover:scale-105",
                )}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>

          {/* Selected color label */}
          <p className="text-[11px] text-gray-600 mt-3 font-medium flex items-center gap-1.5">
            Selected:&nbsp;
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <span className="text-gray-900 font-semibold">
              {selectedColor.name}
            </span>
            <span className="text-gray-400">{selectedColor.code}</span>
          </p>
        </div>
      )}

      {selectedOption !== "shade" && <div className="flex-1" />}

      {/* Generate Button */}
      <Button
        onClick={handleGenerateClick}
        disabled={!selectedOption || generateStatus === "generating"}
        className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20 mt-auto"
      >
        {generateStatus === "generating" ? (
          <>Generating...</>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Generate Variation
          </>
        )}
      </Button>

      <GenerateDialog
        isOpen={showGenerateDialog}
        status={generateStatus}
        selectedOption={selectedOption}
        removeFurniture={removeFurniture}
        onClose={() => setShowGenerateDialog(false)}
        onConfirmComplete={handleViewDesign}
      />
    </div>
  );
}
